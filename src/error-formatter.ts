import { GraphQLError } from 'graphql';

export class CustomError extends Error {
  code: number;
  additionalInfo?: string;

  constructor(message: string, code: number, additionalInfo?: string) {
    super(message);
    this.code = code;
    this.additionalInfo = additionalInfo;
  }
}

export function formatError(error: GraphQLError) {
  if (error.originalError instanceof CustomError) {
    return {
      code: error.originalError.code,
      message: error.message,
      additionalInfo: error.originalError.additionalInfo,
    };
  } else {
    return {
      code: 500,
      message: 'Internal error. Please try again.',
    };
  }
}
