import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Post,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { CreateUserDTO } from '../dto/CreateUserDTO';
import { User } from '../entity/User';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('users')
export class UsersController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  @Post()
  async create(@Body() createRequest: CreateUserDTO) {
    if (createRequest.password !== createRequest.retypedPassword) {
      throw new BadRequestException(['Passwords dont match']);
    }

    const checkUser = await this.userRepository.findOneBy([
      { username: createRequest.username },
      { email: createRequest.email },
    ]);

    if (checkUser) {
      throw new ConflictException('Such user already exists');
    }

    const user = new User();
    user.username = createRequest.username;
    user.password = await this.authService.hashPassword(createRequest.password);
    user.firstName = createRequest.firstName;
    user.lastName = createRequest.lastName;
    user.email = createRequest.email;

    return {
      ...(await this.userRepository.save(user)),
      token: this.authService.getTokenForUser(user),
    };
  }
}
