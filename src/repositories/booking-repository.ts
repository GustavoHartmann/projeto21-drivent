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

async function changeBooking(bookingId: number, roomId: number) {
  return await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      roomId,
    },
  });
}

export const bookingRepository = {
  createBooking,
  checkRoomAvailability,
  getBooking,
  changeBooking,
};
