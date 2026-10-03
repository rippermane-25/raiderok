import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserRole } from '../roles/entities/user-role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ type: 'integer', default: 0 })
  completedOrders: number;

  @Column({ type: 'integer', default: 0 })
  completedDeliveries: number;

  @Column({ default: 'active' })
  status: string;

  @Column({ nullable: true })
  bio: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserRole, (userRole) => userRole.user, { eager: true, cascade: true })
  roles: UserRole[];
}
