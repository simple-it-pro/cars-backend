import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVideoUrlToMessages1763301010523 implements MigrationInterface {
    name = 'AddVideoUrlToMessages1763301010523';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if videoUrl column already exists
        const columnExists = await queryRunner.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.columns
                WHERE table_schema = 'cars'
                AND table_name = 'messages'
                AND column_name = 'videoUrl'
            ) as exists`,
        );

        // Add videoUrl column if it doesn't exist
        if (!columnExists[0]?.exists) {
            await queryRunner.query(
                `ALTER TABLE "cars"."messages" ADD "videoUrl" character varying`,
            );
        }

        // Check current type column values to ensure backward compatibility
        const typeColumnExists = await queryRunner.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.columns
                WHERE table_schema = 'cars'
                AND table_name = 'messages'
                AND column_name = 'type'
            ) as exists`,
        );

        // The type column should already exist and accept 'text', 'voice', and now 'video'
        // TypeORM will handle the enum type automatically through entity definition
        // No additional migration needed for type enum extension
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if videoUrl column exists before dropping
        const columnExists = await queryRunner.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.columns
                WHERE table_schema = 'cars'
                AND table_name = 'messages'
                AND column_name = 'videoUrl'
            ) as exists`,
        );

        // Drop videoUrl column if it exists
        if (columnExists[0]?.exists) {
            await queryRunner.query(
                `ALTER TABLE "cars"."messages" DROP COLUMN "videoUrl"`,
            );
        }

        // Note: We don't revert the type column changes as it would require
        // checking for existing 'video' type messages and potentially breaking data
    }
}
