import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { phone } = createUserDto;

    const existingUser = await this.usersRepository.findOne({ where: { phone } });
    if (existingUser) {
      return existingUser;
    }

    const user = this.usersRepository.create({
      phone,
      status: 'active',
    });

    return this.usersRepository.save(user);
  }

  async findById(id: string) {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.role'],
    });
  }

  async findByPhone(phone: string) {
    return this.usersRepository.findOne({
      where: { phone },
      relations: ['roles', 'roles.role'],
    });
  }

  async createSuperAdmin(phone: string) {
    const user = await this.create({ phone });
    return user;
  }

  async updateProfile(id: string, data: any) {
    await this.usersRepository.update(id, data);
    return this.findById(id);
  }

  async getAllUsers() {
    return this.usersRepository.find({ relations: ['roles', 'roles.role'] });
  }

  async getUsersByRole(roleName: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .where('role.name = :roleName', { roleName })
      .getMany();
  }
}
