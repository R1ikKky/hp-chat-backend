import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPhoneNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  readonly login!: string;

  @ApiProperty()
  @IsPhoneNumber('RU')
  readonly phone!: string;

  @ApiProperty()
  @IsString()
  readonly password!: string;

  @ApiProperty()
  @IsNumber()
  readonly age!: number;

  @ApiProperty()
  @IsString()
  readonly bio!: string;
}
