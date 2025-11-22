import { DataSource } from 'typeorm';
import 'dotenv/config';

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: ['src/**/entities/*{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  schema: 'cars',
});
