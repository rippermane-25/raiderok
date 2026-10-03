import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CouriersService } from './couriers.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('couriers')
export class CouriersController {
  constructor(private couriersService: CouriersService) {}

  @Post('apply')
  @UseGuards(JwtGuard)
  async applyForCourier(@Request() req, @Body() data: any) {
    return this.couriersService.applyForCourier(req.user.id, data);
  }

  @Get('applications/pending')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  async getPendingApplications() {
    return this.couriersService.getPendingApplications();
  }

  @Post('applications/:id/approve')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  async approveApplication(@Param('id') id: string, @Request() req) {
    return this.couriersService.approveApplication(id, req.user.id);
  }

  @Post('applications/:id/reject')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  async rejectApplication(@Param('id') id: string, @Request() req, @Body() body: { reason: string }) {
    return this.couriersService.rejectApplication(id, req.user.id, body.reason);
  }

  @Get('my-application')
  @UseGuards(JwtGuard)
  async myApplication(@Request() req) {
    return this.couriersService.getCourierByUserId(req.user.id);
  }
}
