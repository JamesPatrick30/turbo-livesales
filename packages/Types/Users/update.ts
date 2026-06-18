export interface UpdateUserRoleDto {
    role: "cashier" | "cook";
}

export interface UpdateUserResponseDto {
    message: string;
}

export interface UpdateUserDto {
    email?: string;
    password?: string;
    name?: string;
    role?: "cashier" | "cook";
}