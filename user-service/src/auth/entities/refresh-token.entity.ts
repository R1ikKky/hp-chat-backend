import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UsersEntity } from "../../features/users/entities/user.entity";

@Entity()
export class refreshTokenEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "uuid", nullable: false })
    userId!: string

    @ManyToOne(() => UsersEntity, (u) => u.refreshTokens, { onDelete: "CASCADE" } )
    @JoinColumn({ name: "userId" })
    user!: UsersEntity;

    @Column({ type: "uuid" })
    refreshToken!: string;

    @Column({ type: "varchar", length: 200 })
    ua!: string;

    @Column({ type: "varchar", length: 15 })
    ip!: string;

    @Column({ type: "timestamptz" })
    expiresIn!: Date;

    @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;
}