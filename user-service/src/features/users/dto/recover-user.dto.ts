import { ApiProperty } from "@nestjs/swagger";
import { IsPhoneNumber } from "class-validator";

export class recoverUserDto {
      @ApiProperty({ nullable: false })
    @IsPhoneNumber("RU") phone!: string;
}