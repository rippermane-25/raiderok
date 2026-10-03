import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('courier_applications')
export class CourierApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  licenseNumber: string;

  @Column({ nullable: true })
  vehicleType: string;

  @Column({ nullable: true })
  insurance: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  autoCheckResult: string;

  @Column({ nullable: true })
  adminComment: string;

  @Column({ nullable: true })
  reviewedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
