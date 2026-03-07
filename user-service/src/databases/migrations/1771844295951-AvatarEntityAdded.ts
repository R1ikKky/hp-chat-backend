import { MigrationInterface, QueryRunner } from 'typeorm';

export class AvatarEntityAdded1771844295951 implements MigrationInterface {
  name = 'AvatarEntityAdded1771844295951';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "avatar_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "avatarLink" character varying(255) NOT NULL, "isActive" boolean NOT NULL, "userId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_37b875d776e9a7f8fdcc09ba21c" UNIQUE ("avatarLink"), CONSTRAINT "PK_b3ad7cac7c03911490f4ed9b587" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "avatar_entity" ADD CONSTRAINT "FK_ac4c5f5e48ed651c89fd9ddce6f" FOREIGN KEY ("userId") REFERENCES "users_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "avatar_entity" DROP CONSTRAINT "FK_ac4c5f5e48ed651c89fd9ddce6f"`,
    );
    await queryRunner.query(`DROP TABLE "avatar_entity"`);
  }
}
