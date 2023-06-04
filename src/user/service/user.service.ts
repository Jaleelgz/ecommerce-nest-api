import { Injectable } from '@nestjs/common';
import { CRUDService } from 'src/common/service/crud.service';
import { User, UserDocument } from '../schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as firebase from 'firebase-admin';
import { Model } from 'mongoose';
import { IDecodedIdToken } from '../interface/iDecodedIdToken';

@Injectable()
export class UserService extends CRUDService<UserDocument> {
  private userApp: any;

  constructor(@InjectModel(User.name) readonly userModel: Model<UserDocument>) {
    super(userModel);
    const projectId = process.env.AUTH_FIREBASE_ProjectId;
    const clientEmail = process.env.AUTH_FIREBASE_ClientEmail;
    const privateKey = process.env.AUTH_FIREBASE_PrivateKey.replace(
      /\\n/g,
      '\n',
    );

    this.userApp = firebase.initializeApp({
      credential: firebase.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  async verifyToken(token: string): Promise<IDecodedIdToken> {
    return (await this.userApp
      .auth()
      .verifyIdToken(token, true)) as unknown as IDecodedIdToken;
  }

  async updateUser(uid: string, data: any): Promise<any> {
    return await this.userApp.auth().updateUser(uid, data);
  }

  async createUser(data: any): Promise<any> {
    return await this.userApp.auth().createUser(data);
  }

  async getUserByEmail(email: string): Promise<any> {
    try {
      const user = await this.userApp.auth().getUserByEmail(email);
      return user;
    } catch (e) {
      return undefined;
    }
  }

  async getUserByPhone(phone: string): Promise<any> {
    try {
      const user = await this.userApp.auth().getUserByPhoneNumber(phone);
      return user;
    } catch (e) {
      return undefined;
    }
  }

  async deleteUser(uid: string): Promise<any> {
    return await this.userApp.auth().deleteUser(uid);
  }

  addCustomClaims(
    uid: string,
    claims: { [key: string]: string | any },
  ): Promise<void> {
    return this.userApp.auth().setCustomUserClaims(uid, claims);
  }
}
