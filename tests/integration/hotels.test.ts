import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import supertest from 'supertest';
import * as jwt from 'jsonwebtoken';

import { TicketStatus } from '@prisma/client';
import {
  createEnrollmentWithAddress,
  createPayment,
  createTicket,
  createTicketType,
  createUser,
  createHotel,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /hotels', () => {
  describe('when user is unauthorized', () => {
    it('should respond with status 401 if no token is given', async () => {
      const { status } = await server.get('/hotels');

      expect(status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();

      const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when user doesnt have an enrollment yet', async () => {
      const token = await generateValidToken();

      const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when user doesnt have a ticket yet', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when there is no hotels yet', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 402 when user ticket has not been paid yet ', async () => {
      const isNotRemote = false;
      const includesHotel = true;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(isNotRemote, includesHotel);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when user ticket is remote ', async () => {
      const isRemote = true;
      const doesNotIncludeHotel = false;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(isRemote, doesNotIncludeHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when user ticket does not include hotel ', async () => {
      const isNotRemote = false;
      const doesNotIncludeHotel = false;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(isNotRemote, doesNotIncludeHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });
  });

  describe('when all is good', () => {
    it('should respond with status 200 and with hotels', async () => {
      const isNotRemote = false;
      const includesHotel = true;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(isNotRemote, includesHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();

      const { status, body } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(status).toEqual(httpStatus.OK);
      expect(body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: hotel.id,
            name: hotel.name,
            image: hotel.image,
            createdAt: hotel.createdAt.toISOString(),
            updatedAt: hotel.updatedAt.toISOString(),
          }),
        ]),
      );
    });
  });
});
