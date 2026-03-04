import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber } from 'class-validator';

export class RecoverUserDto {
  @ApiProperty({ nullable: false })
  @IsPhoneNumber('RU')
  readonly phone!: string;
}
