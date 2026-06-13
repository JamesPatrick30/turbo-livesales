export interface LoginRequest {
  role: "cashier" | "cook" | "admin";
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}