import { prisma } from '@/config';

async function createBooking(userId: number, roomId: number) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

async function checkRoomAvailability(roomId: number) {
  return await prisma.room.findUnique({
    where: {
      id: roomId,
    },
    include: {
      Booking: true,
    },
  });
}

async function getBooking(userId: number) {
  return await prisma.booking.findUnique({
    where: {
      userId,
    },
    include: {
      Room: true,
    },
  });
}

export const bookingRepository = {
  createBooking,
  checkRoomAvailability,
  getBooking,
};
