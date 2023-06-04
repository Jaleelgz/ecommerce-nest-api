import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch() // will catch all exceptions and errors in the application
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log('Exception', exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    let message = exception.message;
    let status: number;

    Logger.error(
      `An exception occurred while processing request: [${request.method}  ${request.url}]. [message = ${message}]`,
    );
    Logger.error(exception.stack);

    if (exception instanceof HttpException) {
      status = exception.getStatus();
    } else {
      if (message.startsWith('Cast to ObjectId failed for value')) {
        message = 'Bad ID supplied';
        status = HttpStatus.BAD_REQUEST;
      } else if (message.indexOf('duplicate key error') > -1) {
        message =
          message.substring(
            message.lastIndexOf('{') + 1,
            message.lastIndexOf(':'),
          ) + ' already exist';
        status = HttpStatus.BAD_REQUEST;
      } else if (message.indexOf('validation failed') > -1) {
        message = message.substring(message.lastIndexOf(':'));
        status = HttpStatus.BAD_REQUEST;
      }
    }

    response.status(status).json({
      status: status,
      message: message,
    });
  }
}
