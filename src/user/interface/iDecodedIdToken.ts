import { SignInProviders } from '../enum/signInProviders.enum';

export interface IDecodedIdToken {
  userToken?: string;

  aud: string;

  auth_time: number;

  email?: string;

  email_verified?: boolean;

  exp: number;

  firebase: {
    identities: {
      [SignInProviders.Google]?: string[];
      email?: string | string[];
      phone?: string | string[];
    };

    sign_in_provider: SignInProviders;
  };

  iat: number;

  iss: string;

  phone?: string;

  phone_number?: string;

  picture?: string;

  sub: string;

  uid: string;

  userId?: string;
}
