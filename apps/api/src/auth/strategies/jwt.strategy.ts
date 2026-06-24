// auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    super({
      // Extract JWT from cookie instead of Authorization header
      jwtFromRequest: (req: Request) => {
        return req?.cookies?.['accessToken'] ?? null;
      },
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: {id: string; role: string; email: string; OwnerId: string }) {
    if (!payload) throw new UnauthorizedException();
    return { id: payload.id, email: payload.email, role: payload.role, OwnerId: payload.role === 'ADMIN' ? payload.id : payload.OwnerId };
  }
}