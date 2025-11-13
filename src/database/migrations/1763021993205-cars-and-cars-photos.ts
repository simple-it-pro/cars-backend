import { MigrationInterface, QueryRunner } from 'typeorm';

export class CarsAndCarsPhotos1763021993205 implements MigrationInterface {
    name = 'CarsAndCarsPhotos1763021993205';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "cars"."cars_bodywork_enum" AS ENUM('SEDAN', 'HATCHBACK', 'SUV', 'COUPE', 'CONVERTIBLE', 'WAGON', 'VAN', 'PICKUP', 'MINIVAN', 'ROADSTER', 'CUV')`,
        );
        await queryRunner.query(
            `CREATE TYPE "cars"."cars_fueltype_enum" AS ENUM('PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'LPG', 'CNG', 'HYDROGEN', 'OTHER')`,
        );
        await queryRunner.query(
            `CREATE TYPE "cars"."cars_transmission_enum" AS ENUM('MT', 'AT', 'AMT', 'CVT', 'DCT', 'OTHER')`,
        );
        await queryRunner.query(
            `CREATE TYPE "cars"."cars_status_enum" AS ENUM('WAREHOUSE', 'LISTED', 'ARCHIVED')`,
        );
        await queryRunner.query(
            `CREATE TABLE "cars"."cars" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "ownerId" uuid NOT NULL, "make" character varying(80) NOT NULL, "model" character varying(120) NOT NULL, "year" smallint NOT NULL, "bodywork" "cars"."cars_bodywork_enum" NOT NULL, "fuelType" "cars"."cars_fueltype_enum" NOT NULL, "transmission" "cars"."cars_transmission_enum" NOT NULL, "mileageKm" integer NOT NULL DEFAULT '0', "color" character varying(60), "powerHp" integer, "engineVolumeL" numeric(3,1), "status" "cars"."cars_status_enum" NOT NULL DEFAULT 'WAREHOUSE', "price" numeric(12,2), "fuelConsumption" numeric(5,2), CONSTRAINT "chk_cars_mileage_nonneg" CHECK ("mileageKm" >= 0), CONSTRAINT "PK_fc218aa84e79b477d55322271b6" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "idx_car_created_at" ON "cars"."cars" ("createdAt") `,
        );
        await queryRunner.query(
            `CREATE INDEX "idx_car_updated_at" ON "cars"."cars" ("updatedAt") `,
        );
        await queryRunner.query(
            `CREATE INDEX "idx_cars_status" ON "cars"."cars" ("status") `,
        );
        await queryRunner.query(
            `CREATE INDEX "idx_cars_make_model_year" ON "cars"."cars" ("make", "model", "year") `,
        );
        await queryRunner.query(
            `CREATE INDEX "idx_cars_owner_status" ON "cars"."cars" ("ownerId", "status") `,
        );
        await queryRunner.query(
            `CREATE TABLE "cars"."car_photos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "carId" uuid NOT NULL, "fileId" uuid NOT NULL, "order" integer NOT NULL, CONSTRAINT "PK_d7f7ecfcda4b3ac8ac2cfce1f74" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_ccfb3f035c025b8b9348f34b01" ON "cars"."car_photos" ("carId", "order") `,
        );
        await queryRunner.query(
            `ALTER TABLE "cars"."cars" ADD CONSTRAINT "FK_f011a88b8b052ffd0db75c1ad44" FOREIGN KEY ("ownerId") REFERENCES "cars"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "cars"."car_photos" ADD CONSTRAINT "FK_cadad92c18fba858212e33674eb" FOREIGN KEY ("carId") REFERENCES "cars"."cars"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "cars"."car_photos" ADD CONSTRAINT "FK_39d83de7221c515d071281e744e" FOREIGN KEY ("fileId") REFERENCES "cars"."files"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "cars"."car_photos" DROP CONSTRAINT "FK_39d83de7221c515d071281e744e"`,
        );
        await queryRunner.query(
            `ALTER TABLE "cars"."car_photos" DROP CONSTRAINT "FK_cadad92c18fba858212e33674eb"`,
        );
        await queryRunner.query(
            `ALTER TABLE "cars"."cars" DROP CONSTRAINT "FK_f011a88b8b052ffd0db75c1ad44"`,
        );
        await queryRunner.query(
            `DROP INDEX "cars"."IDX_ccfb3f035c025b8b9348f34b01"`,
        );
        await queryRunner.query(`DROP TABLE "cars"."car_photos"`);
        await queryRunner.query(`DROP INDEX "cars"."idx_cars_owner_status"`);
        await queryRunner.query(`DROP INDEX "cars"."idx_cars_make_model_year"`);
        await queryRunner.query(`DROP INDEX "cars"."idx_cars_status"`);
        await queryRunner.query(`DROP INDEX "cars"."idx_car_updated_at"`);
        await queryRunner.query(`DROP INDEX "cars"."idx_car_created_at"`);
        await queryRunner.query(`DROP TABLE "cars"."cars"`);
        await queryRunner.query(`DROP TYPE "cars"."cars_status_enum"`);
        await queryRunner.query(`DROP TYPE "cars"."cars_transmission_enum"`);
        await queryRunner.query(`DROP TYPE "cars"."cars_fueltype_enum"`);
        await queryRunner.query(`DROP TYPE "cars"."cars_bodywork_enum"`);
    }
}
