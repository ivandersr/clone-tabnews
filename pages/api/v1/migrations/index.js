import migrationRunner from 'node-pg-migrate';
import database from 'infra/database.js';
import { resolve } from 'path';

export default async function migrations(request, response) {    
  const dbClient = await database.getNewClient();
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
    await dbClient.end();
    return response.status(200).json(pendingMigrations);
  }

  if (request.method === 'POST') {
    const appliedMigrations = await migrationRunner(defaultMigrationOptions);
    await dbClient.end();

    if (appliedMigrations.length > 0) {
      return response.status(201).json(appliedMigrations);
    }

    return response.status(200).json([]);
  }

  return response.status(405).end();
}