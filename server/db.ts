import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Construct the DATABASE_URL using the Aiven PostgreSQL credentials
const DATABASE_URL = `postgres://avnadmin:AVNS_0FVAZKqzP696rGkGHMS@quiz-app-ankit-self-quiz-app.i.aivencloud.com:19218/defaultdb?sslmode=require`;

if (!DATABASE_URL) {
  throw new Error(
    "Failed to construct DATABASE_URL from credentials",
  );
}

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });

export const { users, quizAttempts } = schema;