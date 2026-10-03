import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('support')
export class SupportController {
  constructor(private supportService: SupportService) {}

  @Post('ticket')
  @UseGuards(JwtGuard)
  async createTicket(@Request() req, @Body() body: { subject: string; description: string; orderId?: string }) {
    return this.supportService.createTicket(req.user.id, body);
  }

  @Get('tickets')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('moderator', 'admin', 'super_admin')
  async getAllTickets() {
    return this.supportService.getAllTickets();
  }

  @Get('tickets/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('moderator', 'admin', 'super_admin')
  async getTicketById(@Param('id') id: string) {
    return this.supportService.getTicketById(id);
  }

  @Post('tickets/:id/resolve')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('moderator', 'admin', 'super_admin')
  async resolveTicket(@Param('id') id: string, @Request() req, @Body() body: { resolution: string }) {
    return this.supportService.resolveTicket(id, req.user.id, body.resolution);
  }
}
