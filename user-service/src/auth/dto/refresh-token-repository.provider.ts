import { Provider } from "@nestjs/common";
import { IRefreshTokenRepository } from "./refresh-token-repository.interface";
import { RefreshTokenRepository } from "../refresh-token.repository";

export const refreshTokenRepositoryProvider: Provider = {
    provide: IRefreshTokenRepository,
    useClass: RefreshTokenRepository
}