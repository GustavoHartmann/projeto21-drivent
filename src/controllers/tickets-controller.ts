import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { ticketsService } from '@/services';

export async function postTickets(req: AuthenticatedRequest, res: Response) {
  const ticketTypeId = req.body.ticketTypeId as number;
  const { userId } = req;

  if (!ticketTypeId) return res.sendStatus(httpStatus.BAD_REQUEST);

  try {
    const ticket = await ticketsService.postTickets(userId, ticketTypeId);
    return res.status(httpStatus.CREATED).send(ticket);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function getTickets(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const ticket = await ticketsService.getTickets(userId);
    return res.status(httpStatus.OK).send(ticket);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function getTicketsTypes(req: AuthenticatedRequest, res: Response) {
  try {
    const ticketsTypes = await ticketsService.getTicketsTypes();
    return res.status(httpStatus.OK).send(ticketsTypes);
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}
