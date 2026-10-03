import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtGuard)
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get('phone/:phone')
  async getUserByPhone(@Param('phone') phone: string) {
    return this.usersService.findByPhone(phone);
  }

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }
}
