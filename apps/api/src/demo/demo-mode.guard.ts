import {
  CanActivate, ExecutionContext, Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { DEMO_ALLOWED_KEY } from './demo-allowed.decorator';

const WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

@Injectable()
export class DemoModeGuard implements CanActivate {
  constructor(
    private config: ConfigService,
    private reflector: Reflector,
  ) {}

  canActivate(ctx: ExecutionContext): boolean {
    const isDemoMode = this.config.get<boolean>('demo.enabled');
    if (!isDemoMode) return true;

    const isAllowed = this.reflector.getAllAndOverride<boolean>(DEMO_ALLOWED_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isAllowed) return true;

    const request = ctx.switchToHttp().getRequest();
    const isWriteMethod = WRITE_METHODS.includes(request.method);

    if (isWriteMethod) {
      const response = ctx.switchToHttp().getResponse();
      response.status(403).json({
        demo: true,
        statusCode: 403,
        message: 'This action is disabled in demo mode.',
        hint: 'Set DEMO_MODE=false to enable full functionality.',
      });
      return false; // stop the pipeline
    }

    return true;
  }
}