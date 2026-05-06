import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest, RegisterRequest, LoginResponse, ApiResponse } from '@ai-blog/types';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const user = await this.authService.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }
    const result = await this.authService.login(user);
    return { success: true, data: result };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterRequest): Promise<ApiResponse> {
    try {
      const user = await this.authService.register(registerDto);
      return { success: true, data: user, message: 'User registered successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
