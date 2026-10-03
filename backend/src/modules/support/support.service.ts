import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket } from './entities/support-ticket.entity';
import { AuditLogService } from '../../common/services/audit-log.service';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportTicket)
    private supportRepository: Repository<SupportTicket>,
    private auditLogService: AuditLogService,
  ) {}

  async createTicket(userId: string, body: { subject: string; description: string; orderId?: string }) {
    const ticket = this.supportRepository.create({
      userId,
      subject: body.subject,
      description: body.description,
      orderId: body.orderId,
      status: 'open',
    });

    const saved = await this.supportRepository.save(ticket);
    await this.auditLogService.log(userId, 'SupportTicket', saved.id, 'CREATE', {
      subject: body.subject,
    });

    return saved;
  }

  async getAllTickets() {
    return this.supportRepository.find({ relations: ['user', 'order'], order: { createdAt: 'DESC' } });
  }

  async getTicketById(id: string) {
    const ticket = await this.supportRepository.findOne({
      where: { id },
      relations: ['user', 'order'],
    });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    return ticket;
  }

  async resolveTicket(ticketId: string, moderatorId: string, resolution: string) {
    const ticket = await this.getTicketById(ticketId);
    ticket.status = 'resolved';
    ticket.resolution = resolution;
    ticket.assignedTo = moderatorId;

    const saved = await this.supportRepository.save(ticket);
    await this.auditLogService.log(moderatorId, 'SupportTicket', ticketId, 'RESOLVE', {
      resolution,
    });

    return saved;
  }
}
