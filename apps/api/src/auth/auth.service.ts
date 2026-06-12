import { Injectable } from '@nestjs/common';
import { LoginRequest, LoginResponse } from '@repo/types';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) {}

    HandleCreateToken(data: any): { accessToken: string, refreshToken: string } {
        const accessToken = this.jwtService.sign(data, { expiresIn: '1h' });
        const refreshToken = this.jwtService.sign({ ...data, type: 'refresh' }, { expiresIn: '7d' });
        return { accessToken, refreshToken };
    }

    HandleLogin(authRequest: LoginRequest): Promise<LoginResponse> {
        const { email, password } = authRequest;
        const { accessToken, refreshToken } = this.HandleCreateToken({ email });
        console.log(`User ${email} logged in with password ${password}`);
        return Promise.resolve({ accessToken, refreshToken });
    }
}
