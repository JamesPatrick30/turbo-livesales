import { Injectable, NotFoundException } from '@nestjs/common';
import { LoginRequest, LoginResponse } from '@repo/types';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) {}

    HandleCreateToken(data: any): { accessToken: string, refreshToken: string } {
        const accessToken = this.jwtService.sign(data, { expiresIn: '1h' });
        const refreshToken = this.jwtService.sign({ ...data, type: 'refresh' }, { expiresIn: '7d' });
        return { accessToken, refreshToken };
    }

    handlePasswordHash(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    handlePasswordCompare(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
    async HandleLogin(authRequest: LoginRequest): Promise<LoginResponse> {
        const { email, password } = authRequest;

        // For demonstration, we use a hardcoded password hash. In a real application, you'd fetch this from the database.
        const passwordHash = await this.handlePasswordHash('demo123');

        if (await this.handlePasswordCompare(password, passwordHash)){
            return Promise.reject(new NotFoundException('Invalid credentials'));
        }
        const { accessToken, refreshToken } = this.HandleCreateToken({ email });
        console.log(`User ${email} logged in with password ${password}`);
        return Promise.resolve({ accessToken, refreshToken });
    }
}
