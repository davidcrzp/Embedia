import postgres from 'postgres';
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('Falta DATABASE_URL en el entorno.');
export const sql = postgres(connectionString, { onnotice: () => {}, max: 10, idle_timeout: 20 });
