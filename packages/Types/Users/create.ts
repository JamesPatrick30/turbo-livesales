export interface CreateUserDto {
    email: string;
    password: string;
    name: string;
    role: "cashier" | "cook";
}

export interface CreateUserResponseDto {
    message: string;
}