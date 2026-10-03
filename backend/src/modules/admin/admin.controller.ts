import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { AuditLogService } from '../../common/services/audit-log.service';

@Controller('admin')
export class AdminController {
  constructor(private auditLogService: AuditLogService) {}

  @Get('logs')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  async getLogs() {
    return this.auditLogService.getLogs();
  }

  @Get('dashboard')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'moderator')
  async dashboard(@Request() req) {
    return {
      user: req.user.phone,
      roles: req.user.roles?.map((role) => role.name) || [],
      message: 'Admin dashboard ready',
    };
  }
}
