import { Controller, Post, Get, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtGuard)
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.id, createOrderDto);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Get('customer/my-orders')
  @UseGuards(JwtGuard)
  async getMyOrders(@Request() req) {
    return this.ordersService.getOrdersByCustomer(req.user.id);
  }

  @Get()
  async getPublishedOrders() {
    return this.ordersService.getPublishedOrders();
  }

  @Patch(':id/status')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('courier', 'admin', 'super_admin')
  async updateOrderStatus(
    @Param('id') id: string,
    @Request() req,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, req.user.id, updateDto);
  }

  @Post(':id/select-courier')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('customer')
  async selectCourier(@Param('id') id: string, @Request() req, @Body() body: { courierId: string }) {
    return this.ordersService.selectCourier(id, body.courierId, req.user.id);
  }

  @Post(':id/cancel')
  @UseGuards(JwtGuard)
  async cancelOrder(@Param('id') id: string, @Request() req, @Body() body?: { reason?: string }) {
    return this.ordersService.cancelOrder(id, req.user.id, body?.reason);
  }

  @Post(':id/complete')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('courier')
  async completeOrder(@Param('id') id: string, @Request() req) {
    return this.ordersService.completeOrder(id, req.user.id);
  }
}
