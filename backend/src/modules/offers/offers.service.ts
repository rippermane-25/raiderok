import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderOffer } from './entities/offer.entity';
import { OrdersService } from '../orders/orders.service';
import { AuditLogService } from '../../common/services/audit-log.service';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(OrderOffer)
    private offersRepository: Repository<OrderOffer>,
    private ordersService: OrdersService,
    private auditLogService: AuditLogService,
  ) {}

  async createOffer(orderId: string, courierId: string, offeredPrice: number) {
    const order = await this.ordersService.getOrderById(orderId);

    // Check if courier already made offer
    const existingOffer = await this.offersRepository.findOne({
      where: { orderId, courierId },
    });

    if (existingOffer) {
      // Update existing offer
      existingOffer.offeredPrice = offeredPrice;
      existingOffer.status = 'pending';
      const saved = await this.offersRepository.save(existingOffer);

      await this.auditLogService.log(courierId, 'OrderOffer', saved.id, 'UPDATE', {
        price: offeredPrice,
      });

      return saved;
    }

    // Create new offer
    const offer = this.offersRepository.create({
      orderId,
      courierId,
      offeredPrice,
      status: 'pending',
    });

    const saved = await this.offersRepository.save(offer);

    // Update order status if first offer
    if (order.status === 'published') {
      await this.ordersService.updateOrderStatus(orderId, courierId, {
        status: 'offer_received',
      });
    }

    // Log action
    await this.auditLogService.log(courierId, 'OrderOffer', saved.id, 'CREATE', {
      price: offeredPrice,
    });

    return saved;
  }

  async getOffersByOrder(orderId: string) {
    return this.offersRepository.find({
      where: { orderId, status: 'pending' },
      relations: ['courier'],
      order: { createdAt: 'ASC' },
    });
  }

  async getCourierOffers(courierId: string) {
    return this.offersRepository.find({
      where: { courierId },
      relations: ['order', 'order.customer'],
      order: { createdAt: 'DESC' },
    });
  }

  async acceptOffer(offerId: string) {
    const offer = await this.offersRepository.findOne({ where: { id: offerId } });

    offer.status = 'accepted';
    return this.offersRepository.save(offer);
  }

  async rejectOffer(offerId: string) {
    const offer = await this.offersRepository.findOne({ where: { id: offerId } });

    offer.status = 'rejected';
    return this.offersRepository.save(offer);
  }
}
