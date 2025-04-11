import prisma from "../../config/prisma";

export const getSamplesService = async () => {
  const samples = await prisma.sample.findMany();
  
  return samples;
};
