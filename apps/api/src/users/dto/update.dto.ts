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
    @IsEnum(["CASHIER", "COOK"])
    role!: "CASHIER" | "COOK";
}

export class UpdateUserRoleRequestDto implements UpdateUserRoleDto {
    @IsEnum(["CASHIER", "COOK"])
    role!: "CASHIER" | "COOK";
}

export class UpdateUserResponse implements UpdateUserResponseDto {
    message!: string;
}

