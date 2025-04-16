import { User } from "@prisma/client";
import prisma from "../../config/prisma";
import { hashPassword } from "../../lib/argon";
import { ApiError } from "../../utils/api-error";
import { nanoid } from "nanoid";

export const registerService = async (
  body: User & { referralCode?: string }
) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      email: body.email,
    },
  });

  if (existingUser) {
    throw new ApiError(400, "Email already exists");
  }

  const referralCode: string = nanoid(8);

  const hashedPassword = await hashPassword(body.password);

  const user = await prisma.user.create({
    data: { ...body, password: hashedPassword, referralCode },
    omit: { password: true },
  });

  if (body.referralCode) {
    const referrer = await prisma.user.findFirst({
      where: {
        referralCode: body.referralCode,
      },
    });

    if (referrer) {
      await prisma.coupon.create({
        data: {
          userId: user.id,
          code: `WELCOME-${nanoid(6)}`,
          discount: 10,
          expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: "active",
          amount: 1,
        },
      });

      await prisma.user.update({
        where: { id: referrer.id },
        data: {
          point: (referrer.point || 0) + 10000,
        },
      });
    }
  }

  return user;
};
