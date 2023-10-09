import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { bookingSchema } from '@/schemas';
import { changeBooking, createBooking, getBooking } from '@/controllers';

const bookingRouter = Router();

bookingRouter
  .all('/*', authenticateToken)
  .post('/', validateBody(bookingSchema), createBooking)
  .get('/', getBooking)
  .put('/:bookingId', changeBooking);

export { bookingRouter };
