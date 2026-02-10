import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class updateUserDto {
  @ApiProperty({ nullable: false })
  @IsString()
  @IsOptional()
  login!: string;
  @ApiProperty({ nullable: false })
  @IsPhoneNumber('RU')
  @IsOptional()
  phone!: string;
  @ApiProperty({ nullable: false })
  @IsString()
  @IsOptional()
  password!: string;
  @ApiProperty({ nullable: false })
  @IsNumber()
  @IsOptional()
  age!: number;
  @ApiProperty({ nullable: false })
  @IsString()
  @IsOptional()
  bio!: string;
}
