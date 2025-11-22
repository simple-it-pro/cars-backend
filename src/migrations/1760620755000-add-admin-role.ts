import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminRole1760620755000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "cars"."users_role_enum" ADD VALUE IF NOT EXISTS 'ADMIN';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Cannot remove enum values in PostgreSQL
  }
}
