import * as jwt from 'jsonwebtoken';
import { CustomError } from './error-formatter';

export function generateToken(email: string, rememberMe: Boolean = false) {
  let expirationTime: number;
  if (rememberMe) {
    expirationTime = 604800;
  } else {
    expirationTime = 120;
  }
  return jwt.sign({ email: email }, 'tokensecret', { expiresIn: expirationTime });
}

export function verifyToken(token: string, secret: string) {
  const decoded: any = jwt.verify(token, secret, (error, decoded) => {
    if (error) {
      throw new CustomError('Invalid token!', 401);
    }
    return decoded;
  });
  if (JSON.stringify(Object.keys(decoded)) !== JSON.stringify(['email', 'iat', 'exp'])) {
    throw new CustomError('Invalid token!', 401);
  }
}
