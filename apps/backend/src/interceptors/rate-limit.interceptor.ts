import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private store: RateLimitStore = {};
  private readonly windowMs = 60 * 1000; // 1 minute
  private readonly maxRequests = 100; // 100 requests per window

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress;
    const now = Date.now();

    // Initialize or get existing record
    if (!this.store[ip] || now > this.store[ip].resetTime) {
      this.store[ip] = {
        count: 1,
        resetTime: now + this.windowMs,
      };
    } else {
      this.store[ip].count++;
    }

    // Check if rate limit exceeded
    if (this.store[ip].count > this.maxRequests) {
      return throwError(() => new HttpException(
        {
          success: false,
          error: 'Too many requests, please try again later',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      ));
    }

    return next.handle().pipe(
      catchError((error) => throwError(() => error)),
    );
  }
}
