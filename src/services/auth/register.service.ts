import { Role, User } from "@prisma/client";
import prisma from "../../config/prisma";
import { hashPassword } from "../../lib/argon";
import { ApiError } from "../../utils/api-error";

const getNanoid = async () => {
  const { nanoid } = await import("nanoid");
  return nanoid;
};

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

  const nanoidFn = await getNanoid();
  const referralCode = nanoidFn(8);
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
    const nanoidForReferral = await getNanoid();
    await prisma.referral.create({
      data: {
        userId: user.id,
        pointsAwarded: 10000,
        discountCoupon: `WELCOME-${nanoidForReferral(8)}`,
      },
    });

    const nanoidForCoupon = await getNanoid();
    await prisma.coupon.create({
      data: {
        userId: user.id,
        code: `WELCOME-${nanoidForCoupon(8)}`,
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
