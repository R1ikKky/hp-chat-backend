import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPhoneNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'User unique identifier', nullable: false })
  @IsString()
  readonly login!: string;

  @ApiProperty({ nullable: false })
  @IsPhoneNumber('RU')
  readonly phone!: string;

  @ApiProperty({ nullable: false })
  @IsString()
  readonly password!: string;

  @ApiProperty({ nullable: false })
  @IsNumber()
  readonly age!: number;

  @ApiProperty({ nullable: false })
  @IsString()
  readonly bio!: string;
}
