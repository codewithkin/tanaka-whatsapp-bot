import { PostgresStore } from '@mastra/pg';
import { config } from 'dotenv';

config();

const storage = new PostgresStore({
  connectionString: process.env.DATABASE_URL,
});

export default storage;
