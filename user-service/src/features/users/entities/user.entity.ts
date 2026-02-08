import { Column, DeleteDateColumn, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { refreshTokenEntity } from "../../../auth/entities/refresh-token.entity";
import { Exclude } from "class-transformer";

@Entity()
export class UsersEntity extends BaseEntity {

    @Column({ type: "varchar", length: 255, unique: true })
    login!: string;

    @Column({ type: "varchar", length: 255, unique: true })
    phone!: string;

    @Column({ type: "varchar", length: 255 })
    password!: string;

    @Column({ type: "int" })
    age!: number;
    
    @Column({ type: "text" })
    bio!: string;

    @DeleteDateColumn({ type: "timestamptz" })
    deletedAt!: Date | null;

    @OneToMany(() => refreshTokenEntity, (r) => r.userId)
    refreshTokens!: refreshTokenEntity[];
}