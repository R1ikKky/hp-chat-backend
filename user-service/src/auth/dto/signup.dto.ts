import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsPhoneNumber,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({ nullable: false })
  @IsString()
  login!: string;
  @ApiProperty({ nullable: false })
  @IsPhoneNumber('RU')
  phone!: string;
  @ApiProperty({ nullable: false })
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[0-9])/, {
    message: 'Password must contain at least one number',
  })
  password!: string;
  @ApiProperty({ nullable: false })
  @IsNumber()
  age!: number;
  @ApiProperty({ nullable: false })
  @IsString()
  bio!: string;
}
