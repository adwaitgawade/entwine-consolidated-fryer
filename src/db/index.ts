import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

export const devdb = drizzle(process.env.DATABASE_URL_DEV!);
export const productiondb = drizzle(process.env.DATABASE_URL_PROD!);