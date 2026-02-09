import { IsUUID } from "class-validator";

export class giveAdminDto {
    @IsUUID() newAdminId!: string
}