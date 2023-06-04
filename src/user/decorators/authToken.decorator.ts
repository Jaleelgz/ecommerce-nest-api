import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IDecodedIdToken } from '../interface/iDecodedIdToken';

export const AuthToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IDecodedIdToken => {
    const request = ctx.switchToHttp().getRequest();
    return request.authToken;
  },
);
