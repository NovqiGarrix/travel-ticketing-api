/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const rateLimitInfo = request['rateLimitInfo'] as {
      limit: number;
      remaining: number;
    };

    return next.handle().pipe(
      tap(() => {
        // @ts-expect-error - Bad type
        response.setHeader(
          'X-Rate-Limit-Limit',
          rateLimitInfo.limit.toString(),
        );
        // @ts-expect-error - Bad type
        response.setHeader(
          'X-Rate-Limit-Remaining',
          rateLimitInfo.remaining.toString(),
        );
      }),
    );
  }
}
