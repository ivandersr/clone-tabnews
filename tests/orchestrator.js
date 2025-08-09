import retry from "async-retry";
import { faker } from "@faker-js/faker";
import database from "infra/database.js";
import migrator from "models/migrator.js";
import user from "models/user.js";

async function waitForAllServices() {
  await waitForWebserver();

  async function waitForWebserver() {
    return retry(fetchStatusPage, {
      retries: 50,
      onRetry: (error, attempt) => {
        console.log(
          `Attempt ${attempt} - Failed to fetch status page - ${error}`,
        );
      },
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      await response.json();
    }
  }
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObject) {
  return await user.create({
    username:
      userObject.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject.email || faker.internet.email(),
    password: userObject.password || "validpassword",
  });
}

const services = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
};

export default services;
