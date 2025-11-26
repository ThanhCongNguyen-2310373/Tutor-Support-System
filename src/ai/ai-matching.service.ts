import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import * as natural from 'natural';

const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

export interface MatchResult {
  tutorId: number;
  tutorName: string;
  tutorEmail: string;
  score: number;
  explanation: MatchExplanation;
  profile: {
    specialization: string;
    yearsExperience: number;
    rating: number;
    hourlyRate: number;
  };
}

export interface MatchExplanation {
  subjectMatch: number; // 40% weight
  experienceMatch: number; // 30% weight
  ratingMatch: number; // 20% weight
  availabilityMatch: number; // 10% weight
  reasons: string[];
}

export interface StudentPreferences {
  subjects: string[]; // ["Giải Tích 1", "Đại Số Tuyến Tính"]
  preferredExperience?: number; // Years
  minRating?: number; // 0-5
  maxHourlyRate?: number; // VND
  availability?: string; // "weekdays", "weekends", "evenings"
}

@Injectable()
export class AIMatchingService {
  private readonly logger = new Logger(AIMatchingService.name);
  private tfidf: any;

  constructor(private prisma: PrismaService) {
    this.tfidf = new TfIdf();
  }

  /**
   * AI Matching: Tìm tutors phù hợp nhất với student dựa trên preferences
   * Algorithm: Content-Based Filtering với TF-IDF và Cosine Similarity
   */
  async matchTutors(
    studentId: number,
    preferences: StudentPreferences,
    limit: number = 5,
  ): Promise<MatchResult[]> {
    this.logger.log(`Matching tutors for student ${studentId}`);

    // 1. Get student profile
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // 2. Get all available tutors
    const tutors = await this.prisma.tutorProfile.findMany({
      where: {
        available: true, // Changed from isApproved
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        availabilitySlots: {
          where: {
            isBooked: false,
          },
          select: {
            startTime: true, // Changed from dayOfWeek
            endTime: true,
          },
        },
      },
    });

    if (tutors.length === 0) {
      return [];
    }

    // 3. Create student profile vector
    const studentVector = this.createProfileVector(preferences);

    // 4. Calculate similarity for each tutor
    const matches: MatchResult[] = [];

    for (const tutor of tutors) {
      // Calculate detailed explanation
      const explanation = this.explainMatch(tutor, preferences);

      // Skip tutors with zero subject match (for edge case: subject not found)
      if (explanation.subjectMatch === 0) {
        continue;
      }

      const tutorVector = this.createTutorVector(tutor, preferences);
      const similarity = this.calculateCosineSimilarity(
        studentVector,
        tutorVector,
      );

      // Calculate final score (0-100)
      const finalScore = Math.round(
        similarity *
          (explanation.subjectMatch * 0.4 +
            explanation.experienceMatch * 0.3 +
            explanation.ratingMatch * 0.2 +
            explanation.availabilityMatch * 0.1),
      );

        matches.push({
        tutorId: tutor.user.id, // Use user.id instead of tutor.id
        tutorName: tutor.user.fullName,
        tutorEmail: tutor.user.email,
        score: finalScore,
        explanation,
        profile: {
          specialization: tutor.expertise.join(', '), // Use expertise array
          yearsExperience: 0, // Not in schema, default to 0
          rating: tutor.averageRating, // Use averageRating
          hourlyRate: 50000, // Not in schema, default 50k VND/h
        },
      });
    }

    // 5. Sort by score and return top N
    const topMatches = matches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    this.logger.log(
      `Found ${topMatches.length} matches for student ${studentId}`,
    );

    return topMatches;
  }

  /**
   * Create TF-IDF vector for student preferences
   */
  private createProfileVector(preferences: StudentPreferences): number[] {
    // Combine all text into one document
    const document = [
      ...preferences.subjects,
      preferences.availability || '',
    ].join(' ');

    // Tokenize and create vector
    const tokens = tokenizer.tokenize(document.toLowerCase());

    // Add document to TF-IDF
    this.tfidf.addDocument(tokens);

    // Get TF-IDF scores
    const vector: number[] = [];
    const terms = new Set(tokens);

    terms.forEach((term) => {
      const score = this.tfidf.tfidf(term, 0);
      vector.push(score);
    });

    return vector;
  }

  /**
   * Create TF-IDF vector for tutor profile
   */
  private createTutorVector(
    tutor: any,
    preferences: StudentPreferences,
  ): number[] {
    // Combine tutor info into document
    const document = [
      tutor.expertise.join(' '), // Changed from specialization
      tutor.bio || '',
      tutor.user.fullName,
    ].join(' ');

    const tokens = tokenizer.tokenize(document.toLowerCase());
    this.tfidf.addDocument(tokens);

    const vector: number[] = [];
    const terms = new Set(tokens);

    terms.forEach((term) => {
      const score = this.tfidf.tfidf(term, 1);
      vector.push(score);
    });

    return vector;
  }

  /**
   * Calculate Cosine Similarity between two vectors
   */
  private calculateCosineSimilarity(
    vectorA: number[],
    vectorB: number[],
  ): number {
    if (vectorA.length === 0 || vectorB.length === 0) {
      return 0;
    }

    // Ensure both vectors have same length
    const maxLength = Math.max(vectorA.length, vectorB.length);
    const paddedA = [...vectorA, ...Array(maxLength - vectorA.length).fill(0)];
    const paddedB = [...vectorB, ...Array(maxLength - vectorB.length).fill(0)];

    // Calculate dot product
    let dotProduct = 0;
    for (let i = 0; i < maxLength; i++) {
      dotProduct += paddedA[i] * paddedB[i];
    }

    // Calculate magnitudes
    const magnitudeA = Math.sqrt(
      paddedA.reduce((sum, val) => sum + val * val, 0),
    );
    const magnitudeB = Math.sqrt(
      paddedB.reduce((sum, val) => sum + val * val, 0),
    );

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    // Cosine similarity
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Explain why this tutor matches (for UI display)
   */
  private explainMatch(
    tutor: any,
    preferences: StudentPreferences,
  ): MatchExplanation {
    const reasons: string[] = [];
    let subjectMatch = 0;
    let experienceMatch = 0;
    let ratingMatch = 0;
    let availabilityMatch = 0;

    // 1. Subject Match (40% weight)
    const tutorSubjects = tutor.expertise.join(' ').toLowerCase(); // Changed
    let subjectCount = 0;

    for (const subject of preferences.subjects) {
      if (tutorSubjects.includes(subject.toLowerCase())) {
        subjectCount++;
        reasons.push(`✅ Chuyên môn: ${subject}`);
      }
    }

    subjectMatch =
      preferences.subjects.length > 0
        ? subjectCount / preferences.subjects.length
        : 0;

    // 2. Experience Match (30% weight) - Schema doesn't have yearsExperience
    // Use number of expertises as proxy
    const experienceProxy = tutor.expertise.length;
    
    if (preferences.preferredExperience) {
      const expDiff = Math.abs(experienceProxy - preferences.preferredExperience);
      experienceMatch = Math.max(0, 1 - expDiff / 10);
      reasons.push(`📊 Số chuyên môn: ${experienceProxy} lĩnh vực`);
    } else {
      experienceMatch = experienceProxy > 0 ? 0.5 : 0;
      reasons.push(`📊 Số chuyên môn: ${experienceProxy} lĩnh vực`);
    }

    // 3. Rating Match (20% weight)
    if (preferences.minRating) {
      ratingMatch = tutor.averageRating >= preferences.minRating ? 1 : 0; // Changed
      if (ratingMatch > 0) {
        reasons.push(`⭐ Đánh giá: ${tutor.averageRating.toFixed(1)}/5 (cao)`);
      }
    } else {
      ratingMatch = tutor.averageRating / 5; // Changed
      reasons.push(`⭐ Đánh giá: ${tutor.averageRating.toFixed(1)}/5`);
    }

    // 4. Availability Match (10% weight)
    const hasSlots = tutor.availabilitySlots.length > 0;
    availabilityMatch = hasSlots ? 1 : 0;

    if (hasSlots) {
      reasons.push(`📅 Có ${tutor.availabilitySlots.length} slot trống`);
    } else {
      reasons.push(`⚠️ Chưa có slot trống`);
    }

    // 5. Hourly Rate (not in schema, skip for now)
    // if (preferences.maxHourlyRate) {
    //   const defaultRate = 50000;
    //   if (defaultRate <= preferences.maxHourlyRate) {
    //     reasons.push(
    //       `💰 Học phí: ${defaultRate.toLocaleString('vi-VN')} VND/h (phù hợp)`,
    //     );
    //   } else {
    //     reasons.push(
    //       `⚠️ Học phí: ${defaultRate.toLocaleString('vi-VN')} VND/h (cao hơn mong muốn)`,
    //     );
    //   }
    // }

    return {
      subjectMatch,
      experienceMatch,
      ratingMatch,
      availabilityMatch,
      reasons,
    };
  }

  /**
   * Get similar tutors based on a reference tutor (for "Tutors like this")
   */
  async getSimilarTutors(tutorId: number, limit: number = 3): Promise<any[]> {
    const referenceTutor = await this.prisma.tutorProfile.findUnique({
      where: { id: tutorId },
    });

    if (!referenceTutor) {
      return [];
    }

    // Get all available tutors (similar to matchTutors but without studentId)
    const tutors = await this.prisma.tutorProfile.findMany({
      where: {
        available: true,
        id: { not: tutorId }, // Exclude reference tutor
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        availabilitySlots: {
          where: {
            isBooked: false,
          },
          select: {
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    if (tutors.length === 0) {
      return [];
    }

    // Create preferences based on reference tutor
    const preferences: StudentPreferences = {
      subjects: referenceTutor.expertise,
      preferredExperience: 0,
      minRating: Math.max(0, referenceTutor.averageRating - 0.5),
    };

    // Create reference vector
    const refVector = this.createProfileVector(preferences);

    // Calculate similarity for each tutor
    const matches: MatchResult[] = [];

    for (const tutor of tutors) {
      const explanation = this.explainMatch(tutor, preferences);
      const tutorVector = this.createTutorVector(tutor, preferences);
      const similarity = this.calculateCosineSimilarity(refVector, tutorVector);

      const finalScore = Math.round(
        similarity *
          (explanation.subjectMatch * 0.4 +
            explanation.experienceMatch * 0.3 +
            explanation.ratingMatch * 0.2 +
            explanation.availabilityMatch * 0.1),
      );

      matches.push({
        tutorId: tutor.user.id, // Use user.id instead of tutor.id
        tutorName: tutor.user.fullName,
        tutorEmail: tutor.user.email,
        score: finalScore,
        explanation,
        profile: {
          specialization: tutor.expertise.join(', '),
          yearsExperience: 0,
          rating: tutor.averageRating,
          hourlyRate: 50000,
        },
      });
    }

    // Sort by score and return top N
    return matches.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}
