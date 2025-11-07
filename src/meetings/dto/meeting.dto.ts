import { ApiProperty } from '@nestjs/swagger';
import { MeetingStatus } from '@prisma/client';

export class MeetingDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  studentId: number;

  @ApiProperty()
  tutorId: number;

  @ApiProperty()
  slotId: number;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty({ enum: MeetingStatus })
  status: MeetingStatus;

  @ApiProperty({ required: false })
  topic?: string;

  @ApiProperty({ required: false })
  student?: {
    id: number;
    fullName: string;
    email: string;
  };

  @ApiProperty({ required: false })
  tutor?: {
    id: number;
    userId: number;
    user?: {
      fullName: string;
      email: string;
    };
  };

  @ApiProperty({ required: false })
  rating?: {
    id: number;
    score: number;
    comment: string;
  };
}
