import supertest from 'supertest';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import * as jwt from 'jsonwebtoken';
import { TicketStatus } from '@prisma/client';
import {
  createBooking,
  createEnrollmentWithAddress,
  createPayment,
  createTicket,
  createTicketType,
  createUser,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { createHotel, createRoomWithHotelId, createRoomWithoutCapacity } from '../factories/hotels-factory';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('POST /booking', () => {
  describe('when user is unauthorized', () => {
    it('should respond with status 401 if no token is given', async () => {
      const { status } = await server.post('/booking');

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();

      const { status } = await server.post('/booking').set('Authorization', `Bearer ${token}`);

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const { status } = await server.post('/booking').set('Authorization', `Bearer ${token}`);

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
    });
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when room id does not exist', async () => {
      const isNotRemote = false;
      const includesHotel = true;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(isNotRemote, includesHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      await createHotel();

      const { status } = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: faker.datatype.number(),
      });

      expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 when room is full', async () => {
      const isNotRemote = false;
      const includesHotel = true;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(isNotRemote, includesHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithoutCapacity(hotel.id);

      const { status } = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: room.id,
      });

      expect(status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when ticket is remote ', async () => {
      const isRemote = true;
      const doesNotIncludeHotel = false;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(isRemote, doesNotIncludeHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const { status } = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: room.id,
      });

      expect(status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when ticket does not include hotel', async () => {
      const isNotRemote = false;
      const doesNotIncludeHotel = false;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(isNotRemote, doesNotIncludeHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const { status } = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: room.id,
      });

      expect(status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 when ticket has not been paid yet ', async () => {
      const isNotRemote = false;
      const includesHotel = true;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(isNotRemote, includesHotel);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const { status } = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: room.id,
      });

      expect(status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 200 and booking id', async () => {
      const isNotRemote = false;
      const includesHotel = true;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(isNotRemote, includesHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const { status, body } = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: room.id,
      });

      expect(status).toEqual(httpStatus.OK);
      expect(body).toEqual({
        bookingId: expect.any(Number),
      });
    });
  });
});

describe('GET /booking', () => {
  describe('when user is unauthorized', () => {
    it('should respond with status 401 if no token is given', async () => {
      const { status } = await server.get('/booking');

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();

      const { status } = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const { status } = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(status).toEqual(httpStatus.UNAUTHORIZED);
    });
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when booking does not exist', async () => {
      const isNotRemote = false;
      const includesHotel = true;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(isNotRemote, includesHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      await createRoomWithHotelId(hotel.id);

      const { status } = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 200, booking id and the room', async () => {
      const isNotRemote = false;
      const includesHotel = true;
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(isNotRemote, includesHotel);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const { status, body } = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(status).toEqual(httpStatus.OK);
      expect(body).toEqual({
        id: booking.id,
        Room: {
          id: room.id,
          name: room.name,
          hotelId: hotel.id,
          capacity: room.capacity,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        },
      });
    });
  });
});
