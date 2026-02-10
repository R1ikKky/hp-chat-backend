import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class LogoutDto {
  @ApiProperty({ nullable: false })
    @IsUUID() refreshToken!: string
}