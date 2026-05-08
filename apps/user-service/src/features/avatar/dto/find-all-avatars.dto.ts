import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetAllAvatarsDto {
  @ApiProperty()
  @IsString()
  readonly userId!: string;
}
