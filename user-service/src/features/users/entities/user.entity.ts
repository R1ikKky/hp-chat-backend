import { Column, DeleteDateColumn, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { refreshTokenEntity } from '../../../auth/entities/refresh-token.entity';
import { Exclude } from 'class-transformer';
import { RoleEnum } from '../../../common/enums/role.enum';
import { AvatarEntity } from '../../avatar/entities/avatar.entity';

@Entity()
export class UsersEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  login!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  phone!: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password!: string;

  @Column({ type: 'int' })
  age!: number;

  @Column({ type: 'text' })
  bio!: string;

  @Column({ type: 'enum', enum: RoleEnum, default: RoleEnum.REGULARUSER })
  role!: RoleEnum;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt!: Date | null;

  @OneToMany(() => refreshTokenEntity, (r) => r.user)
  refreshTokens!: refreshTokenEntity[];

  @OneToMany(() => AvatarEntity, (a) => a.user)
  avatars!: AvatarEntity[];
}
