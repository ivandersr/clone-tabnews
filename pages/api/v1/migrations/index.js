import migrationRunner from 'node-pg-migrate';
import database from 'infra/database.js';
import { resolve } from 'path';

export default async function migrations(request, response) {    
  if (!["GET", "POST"].includes(request.method)) {
    return response.status(405).json({
      error: `Method ${request.method} not allowed`
    });
  }
  let dbClient = null;
  try {
    dbClient = await database.getNewClient();
    const defaultMigrationOptions = {
      dir: resolve('infra', 'migrations'),
      dbClient,
      dryRun: request.method === 'GET',
      direction: 'up',
      verbose: true,
      migrationsTable: 'pgmigrations'
    };
    
    if (request.method === 'GET') {
      const pendingMigrations = await migrationRunner(defaultMigrationOptions);
      return response.status(200).json(pendingMigrations);
    }
  
    if (request.method === 'POST') {
      const appliedMigrations = await migrationRunner(defaultMigrationOptions);
  
      if (appliedMigrations.length > 0) {
        return response.status(201).json(appliedMigrations);
      }
  
      return response.status(200).json([]);
    }
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    await dbClient.end();
  }
}