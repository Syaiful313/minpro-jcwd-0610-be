import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

export const getEventBySlugService = async (slug: string) => {
  const product = await prisma.event.findFirst({
    where: { slug, deletedAt: null },
  });

  if (!product) {
    throw new ApiError(400, "No Event here go out");
  }

  return product;
};
