import { prisma } from '@/config';
import { CreateTicket } from '@/services/tickets-service';

async function postTickets(ticket: CreateTicket) {
  return prisma.ticket.create({
    data: ticket,
  });
}

async function checkEnrollment(userId: number) {
  return await prisma.enrollment.findFirst({
    where: { userId },
  });
}

async function findTicketByEnrollment(enrollmentId: number) {
  return prisma.ticket.findUnique({
    where: { enrollmentId },
    include: {
      TicketType: true,
    },
  });
}

const ticketsRepository = {
  checkEnrollment,
  postTickets,
  findTicketByEnrollment,
};

export default ticketsRepository;
