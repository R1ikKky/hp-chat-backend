import { IsPhoneNumber } from "class-validator";

export class recoverUserDto {
    @IsPhoneNumber("RU") phone!: string;
}