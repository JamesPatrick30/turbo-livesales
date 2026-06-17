import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password!: string;

    @IsNotEmpty()
    name!: string;

    @IsEnum(["cashier", "cook"])
    role!: "cashier" | "cook";
}

export class CreateUserResponseDto {
    message!: string;
}