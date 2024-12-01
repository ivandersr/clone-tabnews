import database from "infra/database.js";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await database.query("drop schema public cascade; create schema public;");
});

test("POST to /api/v1/migrations should return the migrations applied", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(response.status).toBe(201);

  const responseBody = await response.json();

  expect(Array.isArray(responseBody)).toBe(true);
  expect(responseBody.length).toBeGreaterThan(0);

  const migrations = await database.query("SELECT * FROM pgmigrations;");
  expect(migrations.rowCount).toBeGreaterThan(0);

  const responseAfterMigrations = await fetch(
    "http://localhost:3000/api/v1/migrations",
    { method: "POST" },
  );
  expect(responseAfterMigrations.status).toBe(200);

  const responseBodyAfterMigrations = await responseAfterMigrations.json();

  expect(Array.isArray(responseBodyAfterMigrations)).toBe(true);
  expect(responseBodyAfterMigrations.length).toBe(0);
});
