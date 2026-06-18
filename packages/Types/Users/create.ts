export interface CreateUserDto {
    email: string;
    password: string;
    name: string;
    role: "CASHIER" | "COOK";
}

export interface CreateUserResponseDto {
    message: string;
}