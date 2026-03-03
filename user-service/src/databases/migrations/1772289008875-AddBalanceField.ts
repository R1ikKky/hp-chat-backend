import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBalanceField1772289008875 implements MigrationInterface {
  name = 'AddBalanceField1772289008875';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_entity" ADD "balance" numeric NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users_entity" DROP COLUMN "balance"`);
  }
}
