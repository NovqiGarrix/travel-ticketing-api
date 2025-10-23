import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { ValidationException } from './validation.exception';
import { ZodError } from 'zod';

@Catch(ValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const errs = (exception.getResponse() as ZodError).issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    response.status(status).json({
      statusCode: status,
      errors: errs,
    });
  }
}
