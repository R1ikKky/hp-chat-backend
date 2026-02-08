import {
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class updateUserDto {
  @IsString() @IsOptional() login!: string;
  @IsPhoneNumber('RU') @IsOptional() phone!: string;
  @IsString() @IsOptional() password!: string;
  @IsNumber() @IsOptional() age!: number;
  @IsString() @IsOptional() bio!: string;
}
