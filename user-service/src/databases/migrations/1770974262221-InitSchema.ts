import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1770974262221 implements MigrationInterface {
    name = 'InitSchema1770974262221'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_entity_role_enum" AS ENUM('ADMIN', 'REGULARUSER')`);
        await queryRunner.query(`CREATE TABLE "users_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "login" character varying(255) NOT NULL, "phone" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "age" integer NOT NULL, "bio" text NOT NULL, "role" "public"."users_entity_role_enum" NOT NULL DEFAULT 'REGULARUSER', "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_b7e4c1c1f0ea790c11f53db5bf6" UNIQUE ("login"), CONSTRAINT "UQ_a35e93769173d64f997615d6439" UNIQUE ("phone"), CONSTRAINT "PK_d9b0d3777428b67f460cf8a9b14" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "refresh_token_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "refreshToken" text NOT NULL, "ua" character varying(200) NOT NULL, "ip" character varying(15) NOT NULL, "expiresIn" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a78813e06745b2c5d5b9776bfcf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "refresh_token_entity" ADD CONSTRAINT "FK_ebf65cd067163c7c66baa3da1c1" FOREIGN KEY ("userId") REFERENCES "users_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token_entity" DROP CONSTRAINT "FK_ebf65cd067163c7c66baa3da1c1"`);
        await queryRunner.query(`DROP TABLE "refresh_token_entity"`);
        await queryRunner.query(`DROP TABLE "users_entity"`);
        await queryRunner.query(`DROP TYPE "public"."users_entity_role_enum"`);
    }

}
