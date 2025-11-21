import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RescheduleMeetingDto {
  @ApiProperty({ 
    description: 'ID của slot mới muốn chuyển sang',
    example: 15 
  })
  @IsInt({ message: 'newSlotId phải là số nguyên' })
  @IsNotEmpty({ message: 'newSlotId không được để trống' })
  newSlotId: number;
}