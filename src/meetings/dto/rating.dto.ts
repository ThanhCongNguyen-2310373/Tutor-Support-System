import { ApiProperty } from '@nestjs/swagger';

export class RatingDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  studentId: number;

  @ApiProperty()
  meetingId: number;

  @ApiProperty()
  score: number;

  @ApiProperty({ required: false })
  comment?: string;

  @ApiProperty()
  createdAt: Date;
}
