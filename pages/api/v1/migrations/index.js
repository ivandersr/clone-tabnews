import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";
import database from "infra/database.js";
import { resolve } from "path";
import controller from "infra/controller.js";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

let dbClient = null;

const defaultMigrationOptions = {
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function getHandler(request, response) {
  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: true,
      dbClient,
    });

    return response.status(200).json(pendingMigrations);
  } finally {
    await dbClient.end();
  }
}

async function postHandler(request, response) {
  try {
    dbClient = await database.getNewClient();
    const appliedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
      dbClient,
    });
    if (appliedMigrations.length > 0) {
      return response.status(201).json(appliedMigrations);
    }

    return response.status(200).json([]);
  } finally {
    await dbClient.end();
  }
}
