import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { IDecodedIdToken } from '../interface/iDecodedIdToken';
import { UserService } from '../service/user.service';

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      throw new UnauthorizedException('Invalid Token');
    }

    let decodedToken: IDecodedIdToken;
    try {
      decodedToken = await this.userService.verifyToken(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid Token');
    }

    if (!decodedToken) {
      throw new UnauthorizedException();
    }

    request.authToken = { ...decodedToken, userToken: token };

    return decodedToken.email || decodedToken.phone_number || decodedToken.phone
      ? true
      : false;
  }
}
