import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, Complaint } from './entities/review.entity';
import { AuditLogService } from '../../common/services/audit-log.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Complaint)
    private complaintsRepository: Repository<Complaint>,
    private auditLogService: AuditLogService,
  ) {}

  async createReview(reviewerId: string, body: { orderId: string; reviewedUserId: string; rating: number; comment?: string }) {
    const review = this.reviewsRepository.create({
      ...body,
      reviewerId,
      public: true,
    });

    const saved = await this.reviewsRepository.save(review);
    await this.auditLogService.log(reviewerId, 'Review', saved.id, 'CREATE', {
      reviewedUserId: body.reviewedUserId,
      rating: body.rating,
    });

    return saved;
  }

  async getReviewsForUser(userId: string) {
    return this.reviewsRepository.find({
      where: { reviewedUserId: userId },
      relations: ['reviewer'],
      order: { createdAt: 'DESC' },
    });
  }

  async createComplaint(reporterId: string, body: { reviewId: string; reason: string }) {
    const complaint = this.complaintsRepository.create({
      reviewId: body.reviewId,
      reporterId,
      reason: body.reason,
      status: 'open',
    });

    const saved = await this.complaintsRepository.save(complaint);
    await this.auditLogService.log(reporterId, 'Complaint', saved.id, 'CREATE', {
      reviewId: body.reviewId,
    });

    return saved;
  }

  async getComplaints() {
    return this.complaintsRepository.find({ relations: ['review', 'reporter'], order: { createdAt: 'DESC' } });
  }
}
