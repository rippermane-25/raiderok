import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../common/entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(actorId: string, entityType: string, entityId: string, action: string, metadata: any = {}) {
    const log = this.auditLogRepository.create({
      actorId,
      entityType,
      entityId,
      action,
      metadata,
    });

    return this.auditLogRepository.save(log);
  }

  async getLogs() {
    return this.auditLogRepository.find({ order: { createdAt: 'DESC' }, take: 200 });
  }
}
