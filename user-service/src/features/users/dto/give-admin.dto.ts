import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class giveAdminDto {
  @ApiProperty({ nullable: false })
  @IsUUID()
  newAdminId!: string;
}
