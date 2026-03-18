import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetAllAvatarsDto {
  @ApiProperty({ nullable: false })
  @IsString()
  readonly userId!: string;
}
