import { Provider } from '@nestjs/common';
import { IUsersRepository } from './users-repository.adapter';
import { UsersRepository } from './users.repository';

export const usersRepositoryProvider: Provider = {
  provide: IUsersRepository,
  useClass: UsersRepository,
};
