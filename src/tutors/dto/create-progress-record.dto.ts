import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProgressRecordDto {
  @ApiProperty({
    description: 'ID của student',
    example: 5,
  })
  @IsNumber()
  studentId: number;

  @ApiProperty({
    description: 'Ghi chú về tiến độ học tập',
    example: 'Sinh viên đã nắm vững kiến thức về đạo hàm, cần luyện tập thêm về tích phân',
  })
  @IsString()
  note: string;
}
