import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../entity/User';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthGuardJwt } from '../auth-guard.jwt';
import { AuthGuardLocal } from '../auth-guard.local';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(AuthGuardLocal)
  async login(@CurrentUser() user: User) {
    return {
      userId: user.id,
      token: this.authService.getTokenForUser(user),
    };
  }

  @Get('profile')
  @UseGuards(AuthGuardJwt)
  async getProfile(@CurrentUser() user: User): Promise<User> {
    return user;
  }
}
