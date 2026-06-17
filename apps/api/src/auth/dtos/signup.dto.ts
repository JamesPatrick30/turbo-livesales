import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;

    @IsNotEmpty()
  name!: string;
}

export class SignupResponseDto {
    message!: string;
}
