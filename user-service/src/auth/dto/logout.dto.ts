import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class logoutDto {
  @ApiProperty({ nullable: false })
    @IsUUID() refreshToken!: string
}