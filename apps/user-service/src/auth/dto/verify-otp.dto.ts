import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty()
  @IsPhoneNumber('RU')
  readonly phone!: string;

  @ApiProperty()
  @IsString()
  @Length(6, 6)
  readonly code!: string;
}
