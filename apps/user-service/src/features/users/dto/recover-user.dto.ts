import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber } from 'class-validator';

export class RecoverUserDto {
  @ApiProperty()
  @IsPhoneNumber('RU')
  readonly phone!: string;
}
