export interface UpdateUserRoleDto {
    role: "CASHIER" | "COOK";
}

export interface UpdateUserResponseDto {
    message: string;
}

export interface UpdateUserDto {
    email?: string;
    password?: string;
    name?: string;
    role?: "CASHIER" | "COOK";
}