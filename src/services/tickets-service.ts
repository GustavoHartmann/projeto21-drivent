import { Ticket } from '@prisma/client';
import { notFoundError } from '@/errors';
import ticketsRepository from '@/repositories/tickets-repository';

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

const ticketsService = {
  postTickets,
};

export default ticketsService;
