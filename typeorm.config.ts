import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';
// eslint-disable-next-line
import { Multer } from 'multer';

config({ path: join(process.cwd(), '.env') });

export default new DataSource({
    type: 'postgres',
    url: process.env.DB_URL,
    synchronize: false,
    logging: true,
    entities: [join(__dirname, 'src/database/entities/**/*.{ts,js}')],
    migrations: [join(__dirname, 'src/database/migrations/*.{ts,js}')],
    subscribers: [join(__dirname, 'src/database/subscribers/*.{ts,js}')],
    migrationsTableName: 'migrations',
    schema: process.env.DB_SCHEMA,
});
