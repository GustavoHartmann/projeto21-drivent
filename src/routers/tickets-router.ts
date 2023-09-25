import { Router } from 'express';
import { ticketsSchema } from '@/schemas/ticket-schema';
import { authenticateToken, validateBody } from '@/middlewares';
import { getTickets, postTickets } from '@/controllers';

const ticketsRouter = Router();

ticketsRouter.all('/*', authenticateToken).post('/', validateBody(ticketsSchema), postTickets).get('/', getTickets);

export { ticketsRouter };
