import { User, Role } from "@prisma/client";
import prisma from "../../config/prisma";
import { hashPassword } from "../../lib/argon";
import { ApiError } from "../../utils/api-error";
import { nanoid } from "nanoid";

export const registerService = async (
  body: Omit<
    User,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "point"
    | "expirationDate"
    | "referralCode"
  > & {
    referralCode?: string;
  }
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

  const { referralCode: inputReferralCode, ...userData } = body;

  let referredById = null;

  if (inputReferralCode) {
    const referrer = await prisma.user.findFirst({
      where: {
        referralCode: inputReferralCode,
      },
    });

    if (referrer) {
      referredById = referrer.id;
    }
  }

  const user = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
      referralCode,
      referredBy: referredById,
      role: userData.role || Role.USER,
    },
  });

  if (referredById) {
    await prisma.referral.create({
      data: {
        userId: user.id,
        pointsAwarded: 10000,
        discountCoupon: `WELCOME-${nanoid(8)}`,
      },
    });

    await prisma.coupon.create({
      data: {
        userId: user.id,
        code: `WELCOME-${nanoid(8)}`,
        discount: 10,
        amount: 1,
        expirationDate: new Date(
          new Date().setMonth(new Date().getMonth() + 3)
        ),
        isUsed: false,
      },
    });

    const referrer = await prisma.user.findUnique({
      where: { id: referredById },
    });

    if (referrer) {
      await prisma.user.update({
        where: { id: referrer.id },
        data: {
          point: referrer.point + 10000,
          expirationDate: new Date(
            new Date().setMonth(new Date().getMonth() + 3)
          ),
        },
      });
    }
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
