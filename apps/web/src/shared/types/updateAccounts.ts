import type {UpdateUserDto, UpdateUserResponseDto} from "@repo/types";

export interface UpdateAccountsRequest extends UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    role: "CASHIER" | "COOK";
}

export interface UpdateAccountsResponse extends UpdateUserResponseDto {
    message: string;
}