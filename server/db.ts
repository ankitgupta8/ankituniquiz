import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Construct the DATABASE_URL using the Aiven PostgreSQL credentials
const DATABASE_URL = `postgres://avnadmin:${process.env.PGPASSWORD}@quiz-app-ankit-self-quiz-app.i.aivencloud.com:19218/defaultdb?sslmode=require`;

if (!process.env.PGPASSWORD) {
  throw new Error(
    "PGPASSWORD must be set. Please provide the database password.",
  );
}

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle(pool, { schema });
export const { users, quizAttempts } = schema;