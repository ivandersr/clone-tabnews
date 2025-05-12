import { Client } from "pg";

async function query(queryObj) {
  let client;
  try {
    client = await getNewClient();
    const result = await client.query(queryObj);
    return result;
  } catch (err) {
    console.log("\nErro dentro do catch do database:");
    console.error(err);
    throw err;
  } finally {
    await client?.end();
  }
}

function getSSLValues() {
  if (process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA,
    };
  }
  return process.env.NODE_ENV === "production" ? true : false;
}

async function getNewClient() {
  const client = new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
    ssl: getSSLValues(),
  });

  await client.connect();
  return client;
}

const database = {
  query,
  getNewClient,
};

export default database;
