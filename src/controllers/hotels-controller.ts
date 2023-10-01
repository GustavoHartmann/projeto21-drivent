import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { hotelsService } from '@/services';
import { notFoundError } from '@/errors';

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const hotels = await hotelsService.getHotels(userId);

  return res.status(httpStatus.OK).send(hotels);
}

export async function getHotelById(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { hotelId } = req.params;

  if (!Number(hotelId)) throw notFoundError();

  const hotels = await hotelsService.getHotelById(userId, Number(hotelId));

  return res.status(httpStatus.OK).send(hotels);
}
