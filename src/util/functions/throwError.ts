import { NextFunction } from 'express';

class HttpError extends Error {
  code: number;

  constructor(message: string, errorCode: number) {
    super(message);
    this.code = errorCode;
  }
}

/**
 * A way to throw errors in non-controller functions.
 *
 * @param parameters.error - The error to be logged. This is used internally and should contain as much info as possible.
 * @param parameters.message - The message to be sent to the frontend. This is user-visible and should be easy to understand.
 * @param parameters.code - The HTTP code of the error.
 */
function throwError({
  error,
  message,
  code,
}: {
  error?: Error;
  message: string;
  code: number;
}): never {
  if (error) {
    console.log(error);
  }

  throw new HttpError(message, code);
}

/**
 * A way to throw errors in controller functions / middleware.
 *
 * @param parameters.error - The error received by the middleware, likely from a `throwError` call in a non-controller function.
 * Please note that unlike in `throwError`, this `error` should be friendly and easy to understand.
 * Logging and additional info should not be provided at this point.
 * @param parameters.fallbackMessage - The message to be sent to the frontend, if not provided by `error`.
 * @param parameters.fallbackCode - The HTTP code to be sent to the frontend, if not provided by `error`.
 */
function passError(
  {
    error,
    fallbackMessage,
    fallbackCode,
  }: {
    error?: Error;
    fallbackMessage: string;
    fallbackCode: number;
  },
  next: NextFunction
) {
  next(error || new HttpError(fallbackMessage, fallbackCode));
}

export { throwError, passError };
