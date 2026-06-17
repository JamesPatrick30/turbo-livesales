import { passport } from 'passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin') {
    constructor(private config: ConfigService) {
        super({
        jwtFromRequest: (req: Request) => {
            return req?.cookies?.['accessToken'] ?? null;
            },
            ignoreExpiration: false,
            secretOrKey: config.get<string>('JWT_SECRET'),
        });
    }

    async validate(payload: { id: string; role: string; email: string }) {
        if (!payload) throw new UnauthorizedException();

        if (payload.role !== 'admin') {
            throw new UnauthorizedException('Access denied. Admins only.');
        }

        return { id: payload.id, email: payload.email, role: payload.role };
    }

}