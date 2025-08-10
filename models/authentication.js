import { UnauthorizedError, NotFoundError } from "infra/errors.js";
import user from "models/user.js";
import password from "models/password.js";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const storedUser = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, storedUser.password);
    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autenticação não conferem",
        action: "Verifique se os dados estão corretos",
      });
    }
    throw error;
  }

  async function findUserByEmail(providedEmail) {
    try {
      const foundUser = await user.findOneByEmail(providedEmail);
      return foundUser;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Email incorreto",
          action: "Verifique se os dados estão corretos",
        });
      }
      throw error;
    }
  }

  async function validatePassword(providedPassword, storedPassword) {
    const correctPasswordMatch = await password.compare(
      providedPassword,
      storedPassword,
    );

    if (!correctPasswordMatch) {
      throw new UnauthorizedError({
        message: "Senha incorreta",
        action: "Verifique se os dados estão corretos",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
