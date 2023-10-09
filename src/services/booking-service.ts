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

export const bookingService = {
  createBooking,
};
