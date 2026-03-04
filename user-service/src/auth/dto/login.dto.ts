import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ nullable: false })
  @IsPhoneNumber('RU')
  readonly phone!: string;

  @ApiProperty({ nullable: false })
  @IsString()
  readonly password!: string;
}

export class LoginResponseDto {
  readonly accessToken!: string;

  readonly refreshToken!: string;

  readonly userId!: string;
}
