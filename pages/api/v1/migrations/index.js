import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";
import database from "infra/database.js";
import { resolve } from "path";
import { MethodNotAllowedError, InternalServerError } from "infra/errors";

const router = createRouter();
router.get(getHandler);
router.post(postHandler);

export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
});

let dbClient = null;

function getDefaultMigrationOptions(dryRun) {
  return {
    dir: resolve("infra", "migrations"),
    dbClient,
    dryRun,
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };
}

async function getHandler(request, response) {
  dbClient = await database.getNewClient();

  const pendingMigrations = await migrationRunner(
    getDefaultMigrationOptions(true)
  );

  await dbClient.end();
  return response.status(200).json(pendingMigrations);
}

async function postHandler(request, response) {
  dbClient = await database.getNewClient();
  const appliedMigrations = await migrationRunner(
    getDefaultMigrationOptions(false)
  );

  await dbClient.end()
  if (appliedMigrations.length > 0) {
    return response.status(201).json(appliedMigrations);
  }

  return response.status(200).json([]);
}

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  console.error(publicErrorObject);
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

async function onErrorHandler(error, request, response) {
  await dbClient.end();
  const publicErrorObject = new InternalServerError({
    cause: error,
  });
  console.error(publicErrorObject);
  response.status(500).json(publicErrorObject);
}
