import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from '../entity/User';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcrypt';

@Injectable({})
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
    super();
  }

  public async validate(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOneBy({
      username,
    });

    if (!user) {
      this.logger.debug(`User with username=${username} not found!`);
      throw new UnauthorizedException();
    }

    if (!(await compare(password, user.password))) {
      this.logger.debug(`User password is invalid!`);
      throw new UnauthorizedException();
    }

    return user;
  }
}
