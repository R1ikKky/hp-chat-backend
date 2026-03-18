import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LogoutDto {
  @ApiProperty({ nullable: false })
  @IsString()
  readonly refreshToken!: string;
}
