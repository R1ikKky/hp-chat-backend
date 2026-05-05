import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ nullable: false })
  @IsPhoneNumber('RU')
  readonly phone!: string;

  @ApiProperty({ nullable: false })
  @IsString()
  @Length(6, 6)
  readonly code!: string;
}
