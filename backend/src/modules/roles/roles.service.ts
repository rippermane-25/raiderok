import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, UserRole } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
  ) {
    this.seedRoles();
  }

  async seedRoles() {
    const roles = ['customer', 'courier', 'moderator', 'admin', 'super_admin'];
    for (const roleName of roles) {
      const existing = await this.rolesRepository.findOne({ where: { name: roleName } });
      if (!existing) {
        await this.rolesRepository.save({ name: roleName, description: `${roleName} role` });
      }
    }
  }

  async assignRoleToUser(userId: string, roleName: string, assignedBy: string) {
    const role = await this.rolesRepository.findOne({ where: { name: roleName } });
    if (!role) {
      throw new NotFoundException(`Role ${roleName} not found`);
    }

    const existing = await this.userRolesRepository.findOne({
      where: { userId, roleId: role.id },
    });

    if (existing) {
      return existing;
    }

    const userRole = this.userRolesRepository.create({
      userId,
      roleId: role.id,
      assignedBy,
      active: true,
    });

    return this.userRolesRepository.save(userRole);
  }

  async getAllRoles() {
    return this.rolesRepository.find();
  }
}
