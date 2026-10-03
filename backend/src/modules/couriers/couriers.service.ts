import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourierApplication } from './entities/courier-application.entity';
import { User } from '../users/entities/user.entity';
import { AuditLogService } from '../../common/services/audit-log.service';

@Injectable()
export class CouriersService {
  constructor(
    @InjectRepository(CourierApplication)
    private applicationsRepository: Repository<CourierApplication>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private auditLogService: AuditLogService,
  ) {}

  async applyForCourier(userId: string, data: any) {
    const existing = await this.applicationsRepository.findOne({
      where: { userId, status: 'pending' },
    });

    if (existing) {
      throw new BadRequestException('You already have a pending courier application');
    }

    const application = this.applicationsRepository.create({
      userId,
      ...data,
      status: 'pending',
      autoCheckResult: 'passed',
    });

    const saved = await this.applicationsRepository.save(application);

    await this.auditLogService.log(userId, 'CourierApplication', saved.id, 'APPLY', data);

    return saved;
  }

  async getPendingApplications() {
    return this.applicationsRepository.find({
      where: { status: 'pending' },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async approveApplication(applicationId: string, adminId: string) {
    const application = await this.applicationsRepository.findOne({
      where: { id: applicationId },
      relations: ['user'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    application.status = 'approved';
    application.reviewedBy = adminId;
    const saved = await this.applicationsRepository.save(application);

    const user = await this.usersRepository.findOne({ where: { id: application.userId } });
    if (user) {
      user.status = 'courier';
      await this.usersRepository.save(user);
    }

    await this.auditLogService.log(adminId, 'CourierApplication', applicationId, 'APPROVE', {
      userId: application.userId,
    });

    return saved;
  }

  async rejectApplication(applicationId: string, adminId: string, reason: string) {
    const application = await this.applicationsRepository.findOne({ where: { id: applicationId } });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    application.status = 'rejected';
    application.adminComment = reason;
    application.reviewedBy = adminId;

    const saved = await this.applicationsRepository.save(application);

    await this.auditLogService.log(adminId, 'CourierApplication', applicationId, 'REJECT', {
      reason,
    });

    return saved;
  }

  async getCourierByUserId(userId: string) {
    return this.applicationsRepository.findOne({
      where: { userId, status: 'approved' },
      relations: ['user'],
    });
  }
}
