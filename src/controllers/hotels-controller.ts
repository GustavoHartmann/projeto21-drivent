import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { hotelsService } from '@/services';

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const hotels = await hotelsService.getHotels(userId);

  return res.status(httpStatus.OK).send(hotels);
}
