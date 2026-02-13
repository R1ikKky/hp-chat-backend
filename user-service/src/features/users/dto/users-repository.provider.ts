import { Provider } from "@nestjs/common";
import { IUsersRepository } from "./users-repository.interface";
import { UsersRepository } from "../users.repository";

export const usersRepositoryProvider: Provider = {
    provide: IUsersRepository,
    useClass: UsersRepository
}