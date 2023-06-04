import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserAccessTokenRequestResponseDTO } from '../dto/common/userAccessTokenRequestResponse.dto';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserAccessTokenRequestResponseDTO => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
