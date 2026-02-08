import { IsUUID } from "class-validator";

export class logoutDto {
    @IsUUID() refreshToken!: string
}