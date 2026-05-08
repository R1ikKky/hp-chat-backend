import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsPhoneNumber('RU')
  readonly phone!: string;

  @ApiProperty()
  @IsString()
  readonly password!: string;
}

export class LoginResponseDto {
  readonly accessToken!: string;
  readonly refreshToken!: string;
  readonly userId!: string;
}
