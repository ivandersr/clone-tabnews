import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import password from "models/password.js";
import user from "models/user.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/test.nonexistent.user",
        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema",
        action: "Verifique se o username está correto",
        status_code: 404,
      });
    });

    test("With duplicated 'username'", async () => {
      await orchestrator.createUser({
        username: "user1.patch",
      });

      await orchestrator.createUser({
        username: "user2.patch",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/user2.patch",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "user1.patch",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O nome de usuário informado já está sendo utilizado",
        action: "Utilize outro nome de usuário para esta operação",
        status_code: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      await orchestrator.createUser({
        email: "email.patch.1@mail.com",
      });

      const user = await orchestrator.createUser({
        email: "email.patch.2@mail.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${user.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "email.patch.1@mail.com",
          }),
        },
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado",
        action: "Utilize outro email para esta operação",
        status_code: 400,
      });
    });

    test("With unique 'username'", async () => {
      await orchestrator.createUser({
        username: "unique.user.patch",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/unique.user.patch",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "unique.user.patch.2",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
      expect(responseBody.username).toBe("unique.user.patch.2");
    });

    test("With unique 'email'", async () => {
      await orchestrator.createUser({
        username: "unique.email.patch",
        email: "unique.email.email.patch@mail.com",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/unique.email.patch",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "unique.email.email.patch.2@mail.com",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
      expect(responseBody.email).toBe("unique.email.email.patch.2@mail.com");
    });

    test("With 'password'", async () => {
      const testUser = await orchestrator.createUser({
        password: "123abc",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${testUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "123456",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(testUser.username);
      const correctPasswordMatch = await password.compare(
        "123456",
        userInDatabase.password,
      );
      const incorrectPasswordMatch = await password.compare(
        "123abc",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
