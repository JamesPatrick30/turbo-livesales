import type {CreateUserDto, CreateUserResponseDto} from "@repo/types";

export interface CreateAccountsRequest extends CreateUserDto {
    name: string;
    email: string;
    password: string;
    role: "CASHIER" | "COOK";
}

export interface CreateAccountsResponse extends CreateUserResponseDto {
    message: string;
}