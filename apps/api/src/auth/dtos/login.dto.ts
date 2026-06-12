import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
import { LoginRequest, LoginResponse } from '@repo/types';
export class LoginDto implements LoginRequest {
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @MaxLength(100)
    password!: string;
}

export class LoginResponseDto implements LoginResponse {
    accessToken!: string;
    refreshToken!: string;
}