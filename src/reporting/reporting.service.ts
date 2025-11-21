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
}