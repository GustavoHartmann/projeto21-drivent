import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { bookingSchema } from '@/schemas';
import { createBooking, getBooking } from '@/controllers';

const bookingRouter = Router();

bookingRouter.all('/*', authenticateToken).post('/', validateBody(bookingSchema), createBooking).get('/', getBooking);

export { bookingRouter };
