import { Ticket, TicketType } from '@prisma/client';
import { notFoundError } from '@/errors';
import { ticketsRepository } from '@/repositories';

export type CreateTicket = Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>;

async function postTickets(userId: number, ticketTypeId: number): Promise<Ticket> {
  const checkEnrollment = await ticketsRepository.checkEnrollment(userId);

  if (!checkEnrollment) throw notFoundError();

  const ticketInfo: CreateTicket = {
    ticketTypeId,
    enrollmentId: checkEnrollment.id,
    status: 'RESERVED',
  };

  const ticket = await ticketsRepository.postTickets(ticketInfo);

  const result = await ticketsRepository.getTicketById(ticket.id);

  return result;
}

async function getTickets(userId: number) {
  const checkEnrollment = await ticketsRepository.checkEnrollment(userId);

  if (!checkEnrollment) throw notFoundError();

  const ticket = await ticketsRepository.getTickets(checkEnrollment.id);

  if (!ticket) throw notFoundError();

  return ticket;
}

async function getTicketsTypes(): Promise<TicketType[]> {
  const ticketsTypes = await ticketsRepository.getTicketsTypes();

  if (!ticketsTypes) throw notFoundError();

  return ticketsTypes;
}

export const ticketsService = {
  postTickets,
  getTickets,
  getTicketsTypes,
};
