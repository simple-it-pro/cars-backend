import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1761553998563 implements MigrationInterface {
    name = 'Init1761553998563';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cars"."users" ADD "image" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "cars"."users" DROP COLUMN "image"`,
        );
    }
}
