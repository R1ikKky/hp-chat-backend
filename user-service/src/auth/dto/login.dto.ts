import { IsPhoneNumber, IsString } from "class-validator";

export class LoginDto {
    @IsPhoneNumber("RU") phone!: string;
    @IsString() password!: string;
}