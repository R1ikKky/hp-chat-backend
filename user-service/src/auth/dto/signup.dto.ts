import {
  IsNumber,
  IsPhoneNumber,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @IsString() login!: string;
  @IsPhoneNumber("RU") phone!: string;
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[0-9])/, {
    message: 'Password must contain at least one number',
  })
  password!: string;
  @IsNumber() age!: number;
  @IsString() bio!: string;
}
