export default class AppError extends Error {
  status: string;
  error: {
    message: string;
  };
  isOperational: boolean;
  constructor(public statusCode: number = 500, public message: string) {
    super(message);
    this.error = {
      message,
    };
    // this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.status = `${statusCode}`;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
