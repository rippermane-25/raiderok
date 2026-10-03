import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtGuard)
  async createReview(@Request() req, @Body() body: { orderId: string; reviewedUserId: string; rating: number; comment?: string }) {
    return this.reviewsService.createReview(req.user.id, body);
  }

  @Get('user/:userId')
  async getReviewsForUser(@Param('userId') userId: string) {
    return this.reviewsService.getReviewsForUser(userId);
  }

  @Post('complaints')
  @UseGuards(JwtGuard)
  async createComplaint(@Request() req, @Body() body: { reviewId: string; reason: string }) {
    return this.reviewsService.createComplaint(req.user.id, body);
  }

  @Get('complaints')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('moderator', 'admin', 'super_admin')
  async getComplaints() {
    return this.reviewsService.getComplaints();
  }
}
