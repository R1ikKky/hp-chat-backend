import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsPhoneNumber,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { UserDto } from '../../common/dtos/user-public.dto';
import { TokensDto } from './tokens.dto';

export class SignupDto {
  @ApiProperty({ nullable: false })
  @IsString()
  readonly login!: string;

  @ApiProperty({ nullable: false })
  @IsPhoneNumber('RU')
  readonly phone!: string;

  @ApiProperty({ nullable: false })
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[0-9])/, {
    message: 'Password must contain at least one number',
  })
  readonly password!: string;

  @ApiProperty({ nullable: false })
  @IsNumber()
  readonly age!: number;

  @ApiProperty({ nullable: false })
  @IsString()
  readonly bio!: string;
}

export class SignupResponseDto {
  readonly user!: UserDto;

  readonly tokens!: TokensDto;
}
