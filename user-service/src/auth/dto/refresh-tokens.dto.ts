import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ nullable: false })
  @IsUUID()
  refreshToken!: string;
}
