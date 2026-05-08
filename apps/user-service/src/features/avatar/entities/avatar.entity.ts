import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsersEntity } from '../../users/entities/user.entity';

@Entity()
export class AvatarEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  avatarLink!: string;

  @Column({ type: 'boolean' })
  isActive!: boolean;

  @Column({ type: 'uuid', nullable: false })
  userId!: string;

  @ManyToOne(() => UsersEntity, (u) => u.avatars, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: UsersEntity;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt!: Date | null;
}
