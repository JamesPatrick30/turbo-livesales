import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UpdateUserDto, UpdateUserRoleDto, UpdateUserResponseDto } from '@repo/types';

export class UpdateUserRequestDto implements UpdateUserDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEnum(["cashier", "cook"])
    role?: "cashier" | "cook";
}

export class UpdateUserRoleRequestDto implements UpdateUserRoleDto {
    @IsEnum(["cashier", "cook"])
    role!: "cashier" | "cook";
}

export class UpdateUserResponse implements UpdateUserResponseDto {
    message!: string;
}

