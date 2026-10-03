import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatusHistory } from './entities/order.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';
import { AuditLogService } from '../../common/services/audit-log.service';

const VALID_STATUSES = [
  'published',
  'waiting_for_offer',
  'offer_received',
  'courier_selected',
  'courier_accepted',
  'pickup_pending',
  'arrived',
  'picked_up',
  'in_transit',
  'delivered',
  'completed',
  'cancelled',
  'dispute',
];

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderStatusHistory)
    private statusHistoryRepository: Repository<OrderStatusHistory>,
    private auditLogService: AuditLogService,
  ) {}

  async createOrder(customerId: string, createOrderDto: CreateOrderDto) {
    if (createOrderDto.customerPrice <= 0) {
      throw new BadRequestException('Price must be greater than 0');
    }

    const order = this.ordersRepository.create({
      customerId,
      ...createOrderDto,
      status: 'published',
    });

    const savedOrder = await this.ordersRepository.save(order);

    // Create status history
    await this.statusHistoryRepository.save({
      orderId: savedOrder.id,
      oldStatus: null,
      newStatus: 'published',
      changedBy: customerId,
    });

    // Log action
    await this.auditLogService.log(customerId, 'Order', savedOrder.id, 'CREATE', {
      from: createOrderDto.pickupAddress,
      to: createOrderDto.deliveryAddress,
      price: createOrderDto.customerPrice,
    });

    return savedOrder;
  }

  async getOrderById(id: string) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['customer', 'selectedCourier', 'statusHistory'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getOrdersByCustomer(customerId: string) {
    return this.ordersRepository.find({
      where: { customerId },
      relations: ['selectedCourier', 'statusHistory'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPublishedOrders() {
    return this.ordersRepository.find({
      where: { status: 'published' },
      relations: ['customer', 'statusHistory'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateOrderStatus(orderId: string, userId: string, updateDto: UpdateOrderStatusDto) {
    const order = await this.getOrderById(orderId);

    if (!VALID_STATUSES.includes(updateDto.status)) {
      throw new BadRequestException(`Invalid status: ${updateDto.status}`);
    }

    const oldStatus = order.status;
    order.status = updateDto.status;

    await this.ordersRepository.save(order);

    // Create status history
    await this.statusHistoryRepository.save({
      orderId,
      oldStatus,
      newStatus: updateDto.status,
      changedBy: userId,
    });

    // Log action
    await this.auditLogService.log(userId, 'Order', orderId, 'STATUS_UPDATE', {
      from: oldStatus,
      to: updateDto.status,
    });

    return order;
  }

  async selectCourier(orderId: string, courierId: string, customerId: string) {
    const order = await this.getOrderById(orderId);

    if (order.customerId !== customerId) {
      throw new BadRequestException('Only order creator can select courier');
    }

    if (order.status !== 'offer_received') {
      throw new BadRequestException('Can only select courier when offers are received');
    }

    order.selectedCourierId = courierId;
    order.status = 'courier_selected';

    const saved = await this.ordersRepository.save(order);

    // Log action
    await this.auditLogService.log(customerId, 'Order', orderId, 'COURIER_SELECTED', {
      courierId,
    });

    return saved;
  }

  async cancelOrder(orderId: string, userId: string, reason?: string) {
    const order = await this.getOrderById(orderId);

    if (order.status === 'completed' || order.status === 'cancelled') {
      throw new BadRequestException('Cannot cancel completed or already cancelled order');
    }

    const oldStatus = order.status;
    order.status = 'cancelled';
    await this.ordersRepository.save(order);

    await this.statusHistoryRepository.save({
      orderId,
      oldStatus,
      newStatus: 'cancelled',
      changedBy: userId,
    });

    // Log action
    await this.auditLogService.log(userId, 'Order', orderId, 'CANCEL', { reason });

    return order;
  }

  async completeOrder(orderId: string, courierId: string) {
    const order = await this.getOrderById(orderId);

    if (order.selectedCourierId !== courierId) {
      throw new BadRequestException('Only assigned courier can complete order');
    }

    if (order.status !== 'delivered') {
      throw new BadRequestException('Order must be delivered before completion');
    }

    order.status = 'completed';
    const saved = await this.ordersRepository.save(order);

    await this.statusHistoryRepository.save({
      orderId,
      oldStatus: 'delivered',
      newStatus: 'completed',
      changedBy: courierId,
    });

    // Log action
    await this.auditLogService.log(courierId, 'Order', orderId, 'COMPLETE', {});

    return saved;
  }
}
