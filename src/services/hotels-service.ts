import { Hotel } from '@prisma/client';
import { notFoundError, requestError } from '@/errors';
import { hotelsRepository } from '@/repositories/hotels-repository';
import { enrollmentRepository, ticketsRepository } from '@/repositories';

async function getHotels(userId: number): Promise<Hotel[]> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();
  if (ticket.status !== 'PAID' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel)
    throw requestError(402, 'payment required');

  const hotels = await hotelsRepository.getHotels();

  if (hotels.length === 0) throw notFoundError();

  return hotels;
}

async function getHotelById(userId: number, hotelId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();
  if (ticket.status !== 'PAID' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel)
    throw requestError(402, 'payment required');

  const hotel = await hotelsRepository.getHotelById(hotelId);
  if (!hotel) throw notFoundError();

  return hotel;
}

export const hotelsService = {
  getHotels,
  getHotelById,
};
