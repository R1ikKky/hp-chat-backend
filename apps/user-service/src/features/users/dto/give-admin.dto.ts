import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GiveAdminDto {
  @ApiProperty()
  @IsUUID()
  readonly newAdminId!: string;
}
