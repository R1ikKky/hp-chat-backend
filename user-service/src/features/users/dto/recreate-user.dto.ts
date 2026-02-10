import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPhoneNumber, IsString } from 'class-validator';

export class RecreateUserDto {
  @ApiProperty({ nullable: false })
  @IsString()
  login!: string;
  @ApiProperty({ nullable: false })
  @IsPhoneNumber('RU')
  phone!: string;
  @ApiProperty({ nullable: false })
  @IsString()
  password!: string;
  @ApiProperty({ nullable: false })
  @IsNumber()
  age!: number;
  @ApiProperty({ nullable: false })
  @IsString()
  bio!: string;
}
