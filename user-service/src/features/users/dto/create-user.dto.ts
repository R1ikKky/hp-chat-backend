import { IsNumber, IsPhoneNumber, IsString } from "class-validator"

export class createUserDto {
    @IsString() login!: string;
    @IsPhoneNumber("RU") phone!: string;
    @IsString() password!: string;
    @IsNumber() age!: number;
    @IsString() bio!: string
}