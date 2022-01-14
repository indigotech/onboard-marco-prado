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
  try {
    const decoded = jwt.verify(token, secret);
    if (JSON.stringify(Object.keys(decoded)) !== JSON.stringify(['email', 'iat', 'exp'])) {
      throw new CustomError('Invalid token!', 401);
    }
  } catch (error) {
    throw new CustomError('Invalid token!', 401);
  }
}
