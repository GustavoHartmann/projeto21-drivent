import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { bookingSchema } from '@/schemas';
import { createBooking } from '@/controllers';

const bookingRouter = Router();

bookingRouter.all('/*', authenticateToken).post('/', validateBody(bookingSchema), createBooking);

export { bookingRouter };
