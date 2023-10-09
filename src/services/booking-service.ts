import { TicketStatus } from '@prisma/client';
import { notFoundError, requestError } from '@/errors';
import { bookingRepository, enrollmentRepository, ticketsRepository } from '@/repositories';

async function createBooking(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();

  const type = ticket.TicketType;

  if (ticket.status === TicketStatus.RESERVED || type.isRemote || !type.includesHotel) {
    throw requestError(403, 'Forbidden');
  }

  const room = await bookingRepository.checkRoomAvailability(roomId);
  if (!room) throw notFoundError();

  if (room.capacity <= room.Booking.length) throw requestError(403, 'Forbidden');

  const booking = await bookingRepository.createBooking(userId, roomId);
  return {
    bookingId: booking.id,
  };
}

async function getBooking(userId: number) {
  const booking = await bookingRepository.getBooking(userId);
  if (!booking) throw notFoundError();

  return {
    id: booking.id,
    Room: booking.Room,
  };
}

async function changeBooking(userId: number, roomId: number, bookingId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();

  const type = ticket.TicketType;

  if (ticket.status === TicketStatus.RESERVED || type.isRemote || !type.includesHotel) {
    throw requestError(403, 'Forbidden');
  }

  const room = await bookingRepository.checkRoomAvailability(roomId);
  if (!room) throw notFoundError();

  if (room.capacity <= room.Booking.length) throw requestError(403, 'Forbidden');

  const userCurrentBooking = await bookingRepository.getBooking(userId);
  if (!userCurrentBooking || userCurrentBooking.id !== bookingId) throw requestError(403, 'Forbidden');

  const userNewbooking = await bookingRepository.changeBooking(bookingId, roomId);
  return {
    bookingId: userNewbooking.id,
  };
}

export const bookingService = {
  createBooking,
  getBooking,
  changeBooking,
};
