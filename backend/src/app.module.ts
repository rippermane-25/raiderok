import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CouriersModule } from './modules/couriers/couriers.module';
import { OffersModule } from './modules/offers/offers.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SupportModule } from './modules/support/support.module';
import { AdminModule } from './modules/admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './modules/users/entities/user.entity';
import { Role, UserRole } from './modules/roles/entities/role.entity';
import { Order, OrderStatusHistory } from './modules/orders/entities/order.entity';
import { OrderOffer } from './modules/offers/entities/offer.entity';
import { CourierApplication } from './modules/couriers/entities/courier-application.entity';
import { Review, Complaint } from './modules/reviews/entities/review.entity';
import { SupportTicket } from './modules/support/entities/support-ticket.entity';
import { AuditLog } from './common/entities/audit-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'raiderok',
      password: process.env.DATABASE_PASSWORD || 'raiderok123',
      database: process.env.DATABASE_NAME || 'raiderok',
      entities: [
        User,
        Role,
        UserRole,
        Order,
        OrderStatusHistory,
        OrderOffer,
        CourierApplication,
        Review,
        Complaint,
        SupportTicket,
        AuditLog,
      ],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    OrdersModule,
    CouriersModule,
    OffersModule,
    ReviewsModule,
    SupportModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
