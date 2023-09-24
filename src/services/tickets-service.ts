import { Ticket } from '@prisma/client';
import { notFoundError } from '@/errors';
import ticketsRepository from '@/repositories/tickets-repository';

export type CreateTicket = Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>;

async function postTickets(userId: number, ticketTypeId: number): Promise<Ticket> {
  const checkEnrollment = await ticketsRepository.checkEnrollment(userId);

  if (!checkEnrollment) throw notFoundError();

  const ticket: CreateTicket = {
    ticketTypeId,
    enrollmentId: checkEnrollment.id,
    status: 'RESERVED',
  };

  await ticketsRepository.postTickets(ticket);

  return await ticketsRepository.findTicketByEnrollment(checkEnrollment.id);
}

const ticketsService = {
  postTickets,
};

export default ticketsService;
