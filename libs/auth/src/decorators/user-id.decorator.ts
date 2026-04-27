import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CustomRequest } from './../interfaces/custom-request.interface';

export const UserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request: CustomRequest = context.switchToHttp().getRequest();
    return request.userId;
  },
);
