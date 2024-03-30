import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './subject.entity';
import { Teacher } from './teacher.entity';
import { User } from '../auth/entity/User';
import { Profile } from '../auth/entity/Profile';
import { hash } from 'bcrypt';

@Controller('school')
export class TrainingController {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  @Post('/create')
  public async savingRelation() {
    const subject = new Subject();
    subject.name = 'Math';

    const teacher1 = new Teacher();
    teacher1.name = 'John Doe';

    const teacher2 = new Teacher();
    teacher2.name = 'Harry Doe';

    subject.teachers = [teacher1, teacher2];
    await this.subjectRepository.save(subject);

    // const subject = await this.subjectRepository.findOne({
    //   where: { id: 3 },
    // });

    // const teacher1 = new Teacher();
    // teacher1.name = 'John Doe';

    // const teacher2 = new Teacher();
    // teacher2.name = 'Harry Doe';

    // subject.teachers = [teacher1, teacher2];
    // await this.teacherRepository.save([teacher1, teacher2]);

    // How to use One to One
    // const user = new User();
    // const profile = new Profile();

    // user.profile = profile;
    // user.profile = null;
    // Save the user here

    // const teacher1 = await this.teacherRepository.findOne({
    //   where: { id: 5 },
    // });
    // const teacher2 = await this.teacherRepository.findOne({
    //   where: { id: 6 },
    // });
    //
    // return await this.subjectRepository
    //   .createQueryBuilder()
    //   .relation(Subject, 'teachers')
    //   .of(subject)
    //   .add([teacher1, teacher2]);
  }

  @Post('/remove')
  public async removingRelation() {
    // const subject = await this.subjectRepository.findOne({
    //   where: {
    //     id: 1,
    //   },
    //   relations: ['teachers'],
    // });
    // subject.teachers = subject.teachers.filter((teacher) => teacher.id !== 2);
    // await this.subjectRepository.save(subject);
    // await this.subjectRepository.remove(subject);
    // await this.subjectRepository
    //   .createQueryBuilder('s')
    //   .update()
    //   .set({ name: 'Confidential' })
    //   .execute();
    await this.subjectRepository
      .createQueryBuilder('s')
      .update()
      .set({ name: 'temp' })
      .where('name = "Math2"')
      .execute();
  }

  @Post('/createUser')
  async createUser() {
    const user = new User();
    user.username = 'testname';
    user.email = 'testemail@email.com';
    user.firstName = 'Firstname';
    user.password = await hash('123', 10);
    user.lastName = 'Lastname';
    const profile = new Profile();
    profile.age = 20;
    profile.user = user;
    user.profile = profile;
    await this.userRepository.save(user);
  }

  @Get('/getUser')
  async getUser() {
    return this.userRepository.findOne({
      where: { id: 11 },
      relations: ['profile'],
    });
  }

  @Post('/deleteUser/:id')
  async deleteUser(@Param('id', new ParseIntPipe()) id: number) {
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: ['profile'],
    });
    if (user) {
      await this.userRepository.delete(user);
      // await this.profileRepository.delete(user.profile);
    }
  }
}
