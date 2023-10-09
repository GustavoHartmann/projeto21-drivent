import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { InputBookingBody } from '@/protocols';
import { bookingService } from '@/services';

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body as InputBookingBody;

  const booking = await bookingService.createBooking(userId, roomId);
  return res.status(httpStatus.OK).send(booking);
}

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const booking = await bookingService.getBooking(userId);
  return res.status(httpStatus.OK).send(booking);
}
