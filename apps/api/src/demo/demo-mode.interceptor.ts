import {
  CallHandler, ExecutionContext, Injectable, NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DemoModeInterceptor implements NestInterceptor {
  constructor(private config: ConfigService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const isDemoMode = this.config.get<boolean>('demo.enabled');
    if (!isDemoMode) return next.handle();

    // Only stamp the header — don't touch the body
    const response = ctx.switchToHttp().getResponse();
    response.setHeader('X-Demo-Mode', 'true');

    return next.handle(); // ← pass data through unchanged
    }
}