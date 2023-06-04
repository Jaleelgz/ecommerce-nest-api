import {
  Body,
  Controller,
  Post,
  Delete,
  BadRequestException,
  UseGuards,
  NotFoundException,
  Put,
  Res,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Auth, getAuth } from 'firebase/auth';
import * as firebase from 'firebase-admin';
import { initializeApp } from 'firebase/app';
import { AuthToken } from '../decorators/authToken.decorator';
import { IDecodedIdToken } from '../interface/iDecodedIdToken';
import { Response } from 'express';
import { UserAccessTokenRequestResponseDTO } from '../dto/common/userAccessTokenRequestResponse.dto';
import { UserAuthGuard } from '../guards/userAuth.guard';
import { SignUpRequestDTO } from '../dto/request/signUpRequest.dto';
import { UserService } from '../service/user.service';

@ApiTags('User')
@Controller('user')
@ApiBearerAuth()
export class UserController {
  private firebaseAuth: Auth;

  constructor(private readonly userService: UserService) {
    const firebaseConfig = {
      apiKey: process.env.AUTH_FIREBASE_API_KEY,
      authDomain: process.env.AUTH_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.AUTH_FIREBASE_ProjectId,
      storageBucket: process.env.AUTH_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.AUTH_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.AUTH_FIREBASE_APP_ID,
      measurementId: process.env.AUTH_FIREBASE_measurementId,
    };

    this.firebaseAuth = getAuth(initializeApp(firebaseConfig));
  }

  @Post('sign_up')
  @UseGuards(UserAuthGuard)
  async signUpUser(
    @Body() body: SignUpRequestDTO,
    @AuthToken() token: IDecodedIdToken,
  ): Promise<any> {
    try {
      if (!(token.email || token.phone_number || token.phone)) {
        throw new BadRequestException('email/phone missing');
      }

      const userExistAggregation = `[
          {
            $match: {
              $or: [{ phone: '${
                token.phone_number ? token.phone_number : body.phone
              }' }, { email: '${token.email ? token.email : body.email}' }]
            },
          },
        ]`;

      const userExistRes = await this.userService.groupedList(
        userExistAggregation,
      );

      if (!userExistRes) {
        throw new BadRequestException();
      }

      if (userExistRes.length > 0) {
        // check if exist
        throw new BadRequestException('Email/Phone exist');
      }

      // delete firebase user
      if (token.phone_number && !token.email) {
        const existFirebaseUser = await this.userService.getUserByEmail(
          body.email,
        );

        if (existFirebaseUser?.uid) {
          await this.userService.deleteUser(existFirebaseUser.uid);
        }
      } else if (token.email && !token.phone_number) {
        const existFirebaseUser = await this.userService.getUserByPhone(
          body.phone,
        );

        if (existFirebaseUser?.uid) {
          await this.userService.deleteUser(existFirebaseUser.uid);
        }
      }

      // create user profile
      const userRes = await this.userService.create({
        ...body,
        phone: token.phone_number ? token.phone_number : body.phone,
        email: token.email ? token.email : body.email,
      });

      if (!userRes) {
        // delete firebase user
        await this.userService.deleteUser(token.uid);
        throw new BadRequestException('Failed to create user');
      }

      await this.userService.updateUser(
        token.uid,
        token.phone_number
          ? { email: body.email, emailVerified: true }
          : {
              phoneNumber: body.phone,
              emailVerified: true,
            },
      );

      const resCustom = await this.userService.addCustomClaims(token.uid, {
        userId: userRes._id ? userRes._id : userRes.id,
      });

      const userAccessTokenRequestResponseDTO =
        new UserAccessTokenRequestResponseDTO();

      userAccessTokenRequestResponseDTO.name = userRes.name;
      userAccessTokenRequestResponseDTO.email = userRes.email;
      userAccessTokenRequestResponseDTO.phone = userRes.phone;
      userAccessTokenRequestResponseDTO.userId = userRes._id
        ? userRes._id
        : userRes.id;

      return {
        userToken: token.userToken,
        name: userRes.name,
        phone: userRes.phone,
        email: userRes.email,
        userId: userRes._id ? userRes._id : userRes.id,
        address: userRes.address,
      };
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Post('sign_in')
  @UseGuards(UserAuthGuard)
  async signInUser(@AuthToken() token: IDecodedIdToken): Promise<any> {
    try {
      if (!token.userId) {
        throw new NotFoundException('User does not exist.');
      }

      const userRes = await this.userService.get(
        { _id: token.userId },
        null,
        null,
        null,
      );

      if (!userRes) {
        throw new NotFoundException('User does not exist.');
      }

      const userAccessTokenRequestResponseDTO =
        new UserAccessTokenRequestResponseDTO();

      userAccessTokenRequestResponseDTO.name = userRes.name;
      userAccessTokenRequestResponseDTO.email = userRes.email;
      userAccessTokenRequestResponseDTO.phone = userRes.phone;
      userAccessTokenRequestResponseDTO.userId = userRes._id
        ? userRes._id
        : userRes.id;

      return {
        userToken: token.userToken,
        name: userRes.name,
        image: userRes.image,
        phone: userRes.phone,
        email: userRes.email,
        userId: userRes._id ? userRes._id : userRes.id,
        address: userRes.address,
      };
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
