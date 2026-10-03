import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ nullable: true })
  selectedCourierId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'selected_courier_id' })
  selectedCourier: User;

  @Column()
  pickupAddress: string;

  @Column()
  deliveryAddress: string;

  @Column()
  recipientName: string;

  @Column()
  recipientPhone: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  weight: number;

  @Column({ type: 'float' })
  customerPrice: number;

  @Column({ nullable: true, type: 'float' })
  finalPrice: number;

  @Column({ default: 'published' })
  status: string;

  @Column({ nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OrderStatusHistory, (history) => history.order, { cascade: true })
  statusHistory: OrderStatusHistory[];
}

@Entity('order_status_history')
export class OrderStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column()
  oldStatus: string;

  @Column()
  newStatus: string;

  @Column({ nullable: true })
  changedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
