import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class ReportingService {
  constructor(private prisma: PrismaService) {}

  // ==================================================================
  // UC_OSA_03: Scholarship for STUDENT TUTORS (Teaching Contribution)
  // Criteria: Numeric MSSV + High GPA + Teaching Hours
  // ==================================================================
  async getStudentTutorScholarshipReport(
    semesterStart: Date, 
    semesterEnd: Date, 
    minTeachingHours: number,
    minGpa: number // Dynamic GPA
  ) {
    // 1. Fetch Tutors with GPA filter applied at DB level
    const tutors = await this.prisma.user.findMany({
      where: {
        role: Role.TUTOR,
        mssv: { not: null },
        gpa: { gte: minGpa }, // Filter by GPA here
      },
      select: {
        id: true,
        fullName: true,
        mssv: true,
        department: true,
        gpa: true,
        tutorProfile: {
          include: {
            tutorMeetings: {
              where: {
                status: 'COMPLETED',
                startTime: { gte: semesterStart },
                endTime: { lte: semesterEnd },
              },
              select: { startTime: true, endTime: true },
            },
          },
        },
      },
    });

    // 2. Filter & Calculate
    const report = tutors
      .filter((user) => /^\d+$/.test(user.mssv || '')) // Only Numeric MSSV
      .map((user) => {
        const meetings = user.tutorProfile?.tutorMeetings || [];
        
        const totalDurationMs = meetings.reduce((acc, m) => {
          return acc + (m.endTime.getTime() - m.startTime.getTime());
        }, 0);
        const totalHours = totalDurationMs / (1000 * 60 * 60);

        return {
          mssv: user.mssv,
          fullName: user.fullName,
          department: user.department,
          gpa: user.gpa,
          hours: parseFloat(totalHours.toFixed(2)),
          type: 'TEACHING',
          qualified: totalHours >= minTeachingHours
        };
      })
      .filter(r => r.qualified) // Only return qualified candidates
      .sort((a, b) => b.hours - a.hours);

    return report;
  }

  // ==================================================================
  // UC_OSA_02: Scholarship for REGULAR STUDENTS (Learning Activity)
  // Criteria: Role Student + High GPA + Learning Hours
  // ==================================================================
  async getStudentLearnerScholarshipReport(
    semesterStart: Date, 
    semesterEnd: Date, 
    minLearningHours: number,
    minGpa: number // Dynamic GPA
  ) {
    // 1. Fetch Students with GPA filter
    const students = await this.prisma.user.findMany({
      where: {
        role: Role.STUDENT,
        gpa: { gte: minGpa }, // Filter by GPA here
      },
      include: {
        studentMeetings: {
          where: {
            status: 'COMPLETED',
            startTime: { gte: semesterStart },
            endTime: { lte: semesterEnd },
          },
          select: { startTime: true, endTime: true },
        },
      },
    });

    // 2. Calculate Learning Hours
    const report = students.map((student) => {
      const totalDurationMs = student.studentMeetings.reduce((acc, meeting) => {
        return acc + (meeting.endTime.getTime() - meeting.startTime.getTime());
      }, 0);

      const totalHours = totalDurationMs / (1000 * 60 * 60);

      return {
        mssv: student.mssv,
        fullName: student.fullName,
        department: student.department,
        gpa: student.gpa,
        hours: parseFloat(totalHours.toFixed(2)),
        type: 'LEARNING',
        qualified: totalHours >= minLearningHours
      };
    })
    .filter(r => r.qualified)
    .sort((a, b) => b.gpa - a.gpa); // Sort learners by GPA usually

    return report;
  }

  // ==================================================================
  // UC_OAA_01: Department Overview (Ratios & Activity)
  // Metric: Tutor/Student Ratio, Session Count
  // ==================================================================
  async getDepartmentOverviewReport() {
    // 1. Aggregate User Counts by Department and Role
    const userGroups = await this.prisma.user.groupBy({
      by: ['department', 'role'],
      _count: {
        id: true,
      },
    });

    // 2. Get Completed Sessions and map to Department
    // (Since Prisma groupBy doesn't support deep relations easily, we fetch and map)
    const sessions = await this.prisma.meeting.findMany({
      where: { status: 'COMPLETED' },
      select: {
        tutor: {
          select: {
            user: { select: { department: true } }
          }
        }
      }
    });

    // 3. Process Data Structures
    const statsMap: Record<string, { students: number; tutors: number; sessions: number }> = {};

    // Helper to init object
    const initDept = (dept: string) => {
      if (!statsMap[dept]) statsMap[dept] = { students: 0, tutors: 0, sessions: 0 };
    };

    // Fill User Counts
    userGroups.forEach((group) => {
      const dept = group.department || 'Unknown';
      initDept(dept);
      if (group.role === Role.STUDENT) statsMap[dept].students += group._count.id;
      if (group.role === Role.TUTOR) statsMap[dept].tutors += group._count.id;
    });

    // Fill Session Counts
    sessions.forEach((s) => {
      const dept = s.tutor.user.department || 'Unknown';
      initDept(dept);
      statsMap[dept].sessions += 1;
    });

    // 4. Calculate Ratios and Format
    return Object.entries(statsMap).map(([dept, data]) => {
      // Calculate Ratio (Avoid division by zero)
      const ratioVal = data.students > 0 ? data.tutors / data.students : 0;
      
      return {
        department: dept,
        totalStudents: data.students,
        totalTutors: data.tutors,
        totalSessions: data.sessions,
        // Format: "1 Tutor per X Students" or raw percentage
        tutorStudentRatio: parseFloat(ratioVal.toFixed(4)), 
        ratioDisplay: `1:${Math.round(1/ratioVal)}` // e.g., 1:50
      };
    }).sort((a, b) => b.totalSessions - a.totalSessions); // Sort by activity
  }

  // ==================================================================
  // UC_OAA_02: Enhanced Department Report for Frontend Dashboard
  // Includes: Total stats, department breakdown, expertise analysis, recommendations
  // ==================================================================
  async getOAADashboardReport(filters?: {
    semester?: string;
    departments?: string[];
    tutorStatus?: 'available' | 'unavailable' | 'all';
  }) {
    const { semester, departments, tutorStatus } = filters || {};

    // 1. Build filters
    const tutorWhere: any = { role: Role.TUTOR };
    if (departments && departments.length > 0) {
      tutorWhere.department = { in: departments };
    }

    const tutorProfileWhere: any = {};
    if (tutorStatus === 'available') tutorProfileWhere.available = true;
    else if (tutorStatus === 'unavailable') tutorProfileWhere.available = false;

    // 2. Fetch Tutors với TutorProfile
    const tutors = await this.prisma.user.findMany({
      where: tutorWhere,
      include: {
        tutorProfile: {
          where: tutorProfileWhere,
          include: {
            tutorMeetings: {
              where: { status: 'COMPLETED' },
            },
          },
        },
      },
    });

    // 3. Fetch Students
    const studentWhere: any = { role: Role.STUDENT };
    if (departments && departments.length > 0) {
      studentWhere.department = { in: departments };
    }

    const students = await this.prisma.user.findMany({
      where: studentWhere,
      include: {
        studentMeetings: {
          where: { status: 'COMPLETED' },
        },
      },
    });

    // 4. Fetch All Completed Meetings
    const meetingWhere: any = { status: 'COMPLETED' };
    if (departments && departments.length > 0) {
      meetingWhere.tutor = {
        user: { department: { in: departments } },
      };
    }

    const meetings = await this.prisma.meeting.findMany({
      where: meetingWhere,
      include: {
        ratings: true,
        tutor: {
          include: {
            user: true,
          },
        },
      },
    });

    // 5. Calculate Total Stats
    const totalStudents = students.length;
    const totalTutors = tutors.filter(t => t.tutorProfile).length;
    const totalMeetings = meetings.length;

    // Calculate average rating
    const allRatings = meetings.flatMap(m => m.ratings.map(r => r.score));
    const averageRating = allRatings.length > 0
      ? parseFloat((allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1))
      : 0;

    // 6. Department Statistics
    const deptMap = new Map<string, {
      tutorCount: number;
      studentCount: number;
      meetingCount: number;
    }>();

    tutors.forEach(t => {
      if (!t.tutorProfile) return;
      const dept = t.department || 'Unknown';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { tutorCount: 0, studentCount: 0, meetingCount: 0 });
      }
      deptMap.get(dept)!.tutorCount++;
      deptMap.get(dept)!.meetingCount += t.tutorProfile.tutorMeetings.length;
    });

    students.forEach(s => {
      const dept = s.department || 'Unknown';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { tutorCount: 0, studentCount: 0, meetingCount: 0 });
      }
      deptMap.get(dept)!.studentCount++;
    });

    const departmentStats = Array.from(deptMap.entries()).map(([name, data]) => {
      const percent = totalTutors > 0
        ? Math.round((data.tutorCount / totalTutors) * 100)
        : 0;
      return {
        name,
        tutorCount: data.tutorCount,
        studentCount: data.studentCount,
        meetingCount: data.meetingCount,
        percent,
      };
    }).sort((a, b) => b.tutorCount - a.tutorCount);

    // 7. Expertise Statistics
    const expertiseMap = new Map<string, {
      tutorCount: number;
      meetingCount: number;
      studentCount: number;
    }>();

    tutors.forEach(t => {
      if (!t.tutorProfile) return;
      const expertiseList = t.tutorProfile.expertise || [];
      const meetingCount = t.tutorProfile.tutorMeetings.length;

      expertiseList.forEach(exp => {
        if (!expertiseMap.has(exp)) {
          expertiseMap.set(exp, { tutorCount: 0, meetingCount: 0, studentCount: 0 });
        }
        const stat = expertiseMap.get(exp)!;
        stat.tutorCount++;
        stat.meetingCount += meetingCount;
        // Estimate student count (unique students from meetings)
        stat.studentCount += meetingCount; // Simplified estimate
      });
    });

    const expertiseStats = Array.from(expertiseMap.entries()).map(([expertise, data]) => {
      const maxMeetings = Math.max(...Array.from(expertiseMap.values()).map(v => v.meetingCount), 1);
      const percent = Math.round((data.meetingCount / maxMeetings) * 100);
      return {
        expertise,
        tutorCount: data.tutorCount,
        meetingCount: data.meetingCount,
        studentCount: data.studentCount,
        percent,
      };
    }).sort((a, b) => b.meetingCount - a.meetingCount);

    // 8. Generate Recommendations
    const recommendations: string[] = [];

    // Recommendation 1: High-demand expertise
    const highDemandExpertise = expertiseStats.filter(e => e.percent > 80);
    if (highDemandExpertise.length > 0) {
      highDemandExpertise.forEach(e => {
        recommendations.push(
          `Chuyên môn "${e.expertise}" có nhu cầu cao (${e.percent}% capacity), cần tuyển thêm 2-3 tutors`
        );
      });
    }

    // Recommendation 2: Low tutor departments
    const lowTutorDepts = departmentStats.filter(d => d.tutorCount < 5);
    if (lowTutorDepts.length > 0) {
      lowTutorDepts.forEach(d => {
        recommendations.push(
          `${d.name} thiếu hụt tutors (chỉ có ${d.tutorCount}), cần ưu tiên tuyển dụng`
        );
      });
    }

    // Recommendation 3: Redistribution suggestion
    const highTutorDepts = departmentStats.filter(d => d.tutorCount > 15);
    const veryLowTutorDepts = departmentStats.filter(d => d.tutorCount < 3);
    if (highTutorDepts.length > 0 && veryLowTutorDepts.length > 0) {
      recommendations.push(
        `Cân nhắc phân bổ lại 1-2 tutors từ ${highTutorDepts[0].name} sang ${veryLowTutorDepts[0].name}`
      );
    }

    // Recommendation 4: Overall growth
    if (totalTutors > 0 && totalStudents / totalTutors > 20) {
      recommendations.push(
        `Tỷ lệ sinh viên/tutor cao (${Math.round(totalStudents / totalTutors)}:1), dự báo học kì tới cần tăng 15-20% số lượng tutor`
      );
    }

    // Default recommendation if no specific issues
    if (recommendations.length === 0) {
      recommendations.push('Hệ thống đang hoạt động ổn định, tiếp tục theo dõi và duy trì chất lượng');
    }

    // 9. Return Complete Report
    return {
      totalStudents,
      totalTutors,
      totalMeetings,
      averageRating,
      departmentStats,
      expertiseStats: expertiseStats.slice(0, 10), // Top 10
      recommendations,
    };
  }

  
}
