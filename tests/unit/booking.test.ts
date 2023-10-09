import faker from '@faker-js/faker';
import {
  createBookingScenario,
  createBookingWithRoomScenario,
  createEnrollmentScenario,
  createRoomScenario,
  createTicketScenario,
} from '../factories';
import { bookingRepository, enrollmentRepository, ticketsRepository } from '@/repositories';
import { bookingService } from '@/services';
import { notFoundError, requestError } from '@/errors';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /booking', () => {
  it('should return not found error when room id does not exist', async () => {
    const mockedEnrollment = createEnrollmentScenario();
    const mockedTicket = createTicketScenario(mockedEnrollment.id);

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockedEnrollment);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockedTicket);
    jest.spyOn(bookingRepository, 'checkRoomAvailability').mockResolvedValueOnce(null);

    const userId = faker.datatype.number();
    const roomId = faker.datatype.number();

    const promise = bookingService.createBooking(userId, roomId);
    expect(promise).rejects.toEqual(notFoundError());
  });

  it('should return request error with status 403 when room is full', async () => {
    const mockedEnrollment = createEnrollmentScenario();
    const mockedTicket = createTicketScenario(mockedEnrollment.id);
    const mockedRoom = createRoomScenario(0);

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockedEnrollment);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockedTicket);
    jest.spyOn(bookingRepository, 'checkRoomAvailability').mockResolvedValueOnce(mockedRoom);

    const promise = bookingService.createBooking(mockedEnrollment.userId, mockedRoom.id);
    expect(promise).rejects.toEqual(requestError(403, 'Forbidden'));
  });

  it('should return request error with status 403 when ticket is remote', async () => {
    const isRemote = true;
    const mockedEnrollment = createEnrollmentScenario();
    const mockedTicket = createTicketScenario(mockedEnrollment.id, isRemote);
    const mockedRoom = createRoomScenario();

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockedEnrollment);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockedTicket);

    const promise = bookingService.createBooking(mockedEnrollment.userId, mockedRoom.id);
    expect(promise).rejects.toEqual(requestError(403, 'Forbidden'));
  });

  it('should return request error with status 403 when ticket does not include hotel', async () => {
    const isNotRemote = false;
    const doesNotIncludeHotel = false;
    const mockedEnrollment = createEnrollmentScenario();
    const mockedTicket = createTicketScenario(mockedEnrollment.id, isNotRemote, doesNotIncludeHotel);
    const mockedRoom = createRoomScenario();

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockedEnrollment);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockedTicket);

    const promise = bookingService.createBooking(mockedEnrollment.userId, mockedRoom.id);
    expect(promise).rejects.toEqual(requestError(403, 'Forbidden'));
  });

  it('should return request error with status 403 when ticket has not been paid yet', async () => {
    const isNotRemote = false;
    const includesHotel = true;
    const mockedEnrollment = createEnrollmentScenario();
    const mockedTicket = createTicketScenario(mockedEnrollment.id, isNotRemote, includesHotel, 'RESERVED');
    const mockedRoom = createRoomScenario();

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockedEnrollment);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockedTicket);

    const promise = bookingService.createBooking(mockedEnrollment.userId, mockedRoom.id);
    expect(promise).rejects.toEqual(requestError(403, 'Forbidden'));
  });

  it('should return with booking id', async () => {
    const mockedEnrollment = createEnrollmentScenario();
    const mockedTicket = createTicketScenario(mockedEnrollment.id);
    const mockedRoom = createRoomScenario();
    const mockedBooking = createBookingScenario(mockedEnrollment.userId, mockedRoom.id);

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockedEnrollment);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockedTicket);
    jest.spyOn(bookingRepository, 'checkRoomAvailability').mockResolvedValueOnce(mockedRoom);
    jest.spyOn(bookingRepository, 'createBooking').mockResolvedValueOnce(mockedBooking);

    const promise = await bookingService.createBooking(mockedEnrollment.userId, mockedRoom.id);
    expect(promise).toEqual({
      bookingId: mockedBooking.id,
    });
  });
});

describe('GET /booking', () => {
  it('should return not found error when booking does not exist', async () => {
    const mockedEnrollment = createEnrollmentScenario();
    const mockedTicket = createTicketScenario(mockedEnrollment.id);

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockedEnrollment);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockedTicket);
    jest.spyOn(bookingRepository, 'getBooking').mockResolvedValueOnce(null);

    const promise = bookingService.getBooking(mockedEnrollment.userId);
    expect(promise).rejects.toEqual(notFoundError());
  });

  it('should return with booking id and the room', async () => {
    const mockedEnrollment = createEnrollmentScenario();
    const mockedTicket = createTicketScenario(mockedEnrollment.id);
    const mockedBookingWithRoom = createBookingWithRoomScenario();

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockedEnrollment);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockedTicket);
    jest.spyOn(bookingRepository, 'getBooking').mockResolvedValueOnce(mockedBookingWithRoom);

    const promise = await bookingService.getBooking(mockedEnrollment.userId);
    expect(promise).toEqual({
      id: mockedBookingWithRoom.id,
      Room: {
        id: mockedBookingWithRoom.Room.id,
        capacity: mockedBookingWithRoom.Room.capacity,
        hotelId: mockedBookingWithRoom.Room.hotelId,
        name: mockedBookingWithRoom.Room.name,
        createdAt: mockedBookingWithRoom.Room.createdAt,
        updatedAt: mockedBookingWithRoom.Room.updatedAt,
      },
    });
  });
});

describe('PUT /booking/:bookingId', () => {
  it('should return not found error when room id does not exist', async () => {
    const mockedEnrollment = createEnrollmentScenario();
    const mockedTicket = createTicketScenario(mockedEnrollment.id);
    const mockedRoom = createRoomScenario();
    const mockedBooking = createBookingScenario(mockedEnrollment.userId, mockedRoom.id);

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockedEnrollment);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockedTicket);
    jest.spyOn(bookingRepository, 'checkRoomAvailability').mockResolvedValueOnce(null);

    const promise = bookingService.changeBooking(mockedEnrollment.userId, mockedRoom.id, mockedBooking.id);
    expect(promise).rejects.toEqual(notFoundError());
  });

  it('should return request error with status 403 when room is full', async () => {
    const mockedEnrollment = createEnrollmentScenario();
    const mockedTicket = createTicketScenario(mockedEnrollment.id);
    const mockedRoom = createRoomScenario(0);
    const mockedBooking = createBookingScenario(mockedEnrollment.userId, mockedRoom.id);

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockedEnrollment);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockedTicket);
    jest.spyOn(bookingRepository, 'checkRoomAvailability').mockResolvedValueOnce(mockedRoom);

    const promise = bookingService.changeBooking(mockedEnrollment.userId, mockedRoom.id, mockedBooking.id);
    expect(promise).rejects.toEqual(requestError(403, 'Forbidden'));
  });

  it('should return request error with status 403 when user does not have a booking ', async () => {
    const mockedEnrollment = createEnrollmentScenario();
    const mockedTicket = createTicketScenario(mockedEnrollment.id);
    const mockedRoom = createRoomScenario();

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockedEnrollment);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockedTicket);
    jest.spyOn(bookingRepository, 'checkRoomAvailability').mockResolvedValueOnce(mockedRoom);
    jest.spyOn(bookingRepository, 'getBooking').mockResolvedValueOnce(null);

    const fakeBookingId = faker.datatype.number();

    const promise = bookingService.changeBooking(mockedEnrollment.userId, mockedRoom.id, fakeBookingId);
    expect(promise).rejects.toEqual(requestError(403, 'Forbidden'));
  });

  it('should return with new booking id', async () => {
    const mockedEnrollment = createEnrollmentScenario();
    const mockedTicket = createTicketScenario(mockedEnrollment.id);
    const mockedBookingWithRoom = createBookingWithRoomScenario();
    const mockedRoom = createRoomScenario();
    const mockedNewBooking = createBookingScenario(mockedEnrollment.userId, mockedRoom.id);

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockedEnrollment);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockedTicket);
    jest.spyOn(bookingRepository, 'checkRoomAvailability').mockResolvedValueOnce(mockedRoom);
    jest.spyOn(bookingRepository, 'getBooking').mockResolvedValueOnce(mockedBookingWithRoom);
    jest.spyOn(bookingRepository, 'changeBooking').mockResolvedValueOnce(mockedNewBooking);

    const promise = await bookingService.changeBooking(
      mockedEnrollment.userId,
      mockedRoom.id,
      mockedBookingWithRoom.id,
    );
    expect(promise).toEqual({
      bookingId: mockedNewBooking.id,
    });
  });
});
