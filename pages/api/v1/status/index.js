import database from "infra/database.js";
import { InternalServerError } from "infra/errors";

async function status(request, response) {
  try {
    const updatedAt = new Date().toISOString();

    const versionResult = await database.query("SHOW server_version;");
    const databaseVersion = versionResult.rows[0].server_version;

    const maxConnResult = await database.query("SHOW max_connections;");
    const maxConnections = maxConnResult.rows[0].max_connections;

    const activeConnResult = await database.query({
      text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [process.env.POSTGRES_DB],
    });
    const activeConnections = activeConnResult.rows[0].count;

    response.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: databaseVersion,
          max_connections: parseInt(maxConnections),
          active_connections: activeConnections,
        },
      },
    });
  } catch (err) {
    const publicErrorObject = new InternalServerError({
      cause: err,
    });
    console.log("\nErro dentro do catch do controller:");
    console.error(publicErrorObject);
    response.status(500).json(publicErrorObject);
  }
}

export default status;
