import { UserDto } from '../../common/dtos/user-public.dto';
import { TokensDto } from './tokens.dto';

export class SignupResponseDto {
  user!: UserDto;
  tokens!: TokensDto;
}
