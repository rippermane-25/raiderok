import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { OffersService } from './offers.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('offers')
export class OffersController {
  constructor(private offersService: OffersService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('courier')
  async createOffer(
    @Request() req,
    @Body() body: { orderId: string; offeredPrice: number },
  ) {
    return this.offersService.createOffer(body.orderId, req.user.id, body.offeredPrice);
  }

  @Get('order/:orderId')
  async getOffersByOrder(@Param('orderId') orderId: string) {
    return this.offersService.getOffersByOrder(orderId);
  }

  @Get('courier/my-offers')
  @UseGuards(JwtGuard)
  async getCourierOffers(@Request() req) {
    return this.offersService.getCourierOffers(req.user.id);
  }
}
