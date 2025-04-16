import { User } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { comparePassword } from "../../lib/argon";
import { sign } from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../../config/env";

interface Body extends Pick<User, "email" | "password"> {}

export const loginService = async (body: Body) => {
  try {
    const { email, password } = body;

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid password");
    }

    const { password: pass, ...userWithoutPassword } = user;

    const token = sign({ id: user.id }, JWT_SECRET_KEY!, { expiresIn: "2h" });

    return { ...userWithoutPassword, token };
  } catch (error) {
    throw error;
  }
};
