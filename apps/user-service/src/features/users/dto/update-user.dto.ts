import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly login!: string;

  @ApiProperty()
  @IsPhoneNumber('RU')
  @IsOptional()
  readonly phone!: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly password!: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly age!: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly bio!: string;
}
