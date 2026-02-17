import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ nullable: false })
  @IsPhoneNumber('RU')
  phone!: string;
  @ApiProperty({ nullable: false })
  @IsString()
  password!: string;
}

export class LoginResponseDto {
  accessToken!: string;
  refreshToken!: string;
  userId!: string;
}
