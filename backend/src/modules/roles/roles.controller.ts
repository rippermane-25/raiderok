import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  async getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  @Post('assign')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  async assignRole(@Request() req, @Body() body: { userId: string; roleName: string }) {
    return this.rolesService.assignRoleToUser(body.userId, body.roleName, req.user.id);
  }
}
