import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ nullable: false })
  @IsString()
  @IsOptional()
  readonly login!: string;

  @ApiProperty({ nullable: false })
  @IsPhoneNumber('RU')
  @IsOptional()
  readonly phone!: string;

  @ApiProperty({ nullable: false })
  @IsString()
  @IsOptional()
  readonly password!: string;

  @ApiProperty({ nullable: false })
  @IsNumber()
  @IsOptional()
  readonly age!: number;

  @ApiProperty({ nullable: false })
  @IsString()
  @IsOptional()
  readonly bio!: string;
}
