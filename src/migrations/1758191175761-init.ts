import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1758191175761 implements MigrationInterface {
    name = 'Init1758191175761'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cars"."users" ADD CONSTRAINT "UQ_ad02a1be8707004cb805a4b5023" UNIQUE ("nickname")`);
        await queryRunner.query(`ALTER TABLE "cars"."users" DROP COLUMN "birthdate"`);
        await queryRunner.query(`ALTER TABLE "cars"."users" ADD "birthdate" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cars"."users" DROP COLUMN "birthdate"`);
        await queryRunner.query(`ALTER TABLE "cars"."users" ADD "birthdate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "cars"."users" DROP CONSTRAINT "UQ_ad02a1be8707004cb805a4b5023"`);
    }

}
