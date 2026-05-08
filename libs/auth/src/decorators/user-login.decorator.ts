import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CustomRequest } from './../interfaces/custom-request.interface';

export const UserLogin = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<CustomRequest>();
    return request.userLogin;
  },
);
