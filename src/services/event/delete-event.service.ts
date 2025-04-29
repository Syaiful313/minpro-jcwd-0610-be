import prisma from "../../config/prisma";
import { cloudinaryRemove } from "../../lib/cloudinary";
import { ApiError } from "../../utils/api-error";

export const deleteEventService = async (id: number, userId: number) => {
  const event = await prisma.event.findFirst({
    where: { id },
    include: { organizer: true },
  });

  if (!event) {
    throw new ApiError(404, "Event not found");
  }
console.log("cek")
  const user = await prisma.user.findFirst({
    where: { id: userId },
    include: {organizer: true},
  });
  if (event.organizer.id !== user?.organizer?.id) {
    throw new ApiError(
      403,
      `You are not created to this event, please contact ${event.organizer.companyName} to delete this event`
    );
  }


      await cloudinaryRemove(event.thumbnail)
  

  await prisma.event.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return { message: "Event deleted successfully" };
};
