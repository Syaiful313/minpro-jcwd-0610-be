import { scheduleJob } from "node-schedule";
import prisma from "../config/prisma";

const expirePoints = async () => {
  const now = new Date();

  const expiredPoints = await prisma.user.findMany({
    where: {
      expirationDate: { lte: now },
    },
  });

  for (const user of expiredPoints) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        point: 0,
        expirationDate: null,
      },
    });
  }

};

scheduleJob("0 0 * * *", expirePoints);

