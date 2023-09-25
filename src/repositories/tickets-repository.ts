import { prisma } from '@/config';
import { CreateTicket } from '@/services';

async function postTickets(ticket: CreateTicket) {
  return prisma.ticket.create({
    data: ticket,
  });
}

async function checkEnrollment(userId: number) {
  return await prisma.enrollment.findUnique({
    where: { userId },
  });
}

async function getTicketById(id: number) {
  return prisma.ticket.findUnique({
    where: { id },
    include: {
      TicketType: true,
    },
  });
}

async function getTickets(enrollmentId: number) {
  return await prisma.ticket.findFirst({
    where: { enrollmentId },
    include: {
      TicketType: true,
    },
  });
}

export const ticketsRepository = {
  checkEnrollment,
  postTickets,
  getTicketById,
  getTickets,
};
