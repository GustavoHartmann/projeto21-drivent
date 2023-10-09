import faker from '@faker-js/faker';
import {
  createBookingScenario,
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
    const mockedEnroolment = createEnrollmentScenario();
    const mockedTicket = createTicketScenario(mockedEnroolment.id);

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockedEnroolment);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockedTicket);
    jest.spyOn(bookingRepository, 'checkRoomAvailability').mockResolvedValueOnce(null);

    const userId = faker.datatype.number();
    const roomId = faker.datatype.number();

    const promise = bookingService.createBooking(userId, roomId);
    expect(promise).rejects.toEqual(notFoundError());
  });

  it('should return request error with status 403 when room is full', async () => {
    const mockedEnroolment = createEnrollmentScenario();
    const mockedTicket = createTicketScenario(mockedEnroolment.id);
    const mockedRoom = createRoomScenario(0);

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockedEnroolment);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockedTicket);
    jest.spyOn(bookingRepository, 'checkRoomAvailability').mockResolvedValueOnce(mockedRoom);

    const promise = bookingService.createBooking(mockedEnroolment.userId, mockedRoom.id);
    expect(promise).rejects.toEqual(requestError(403, 'Forbidden'));
  });

  it('should return request error with status 403 when ticket is remote', async () => {
    const isRemote = true;
    const mockedEnroolment = createEnrollmentScenario();
    const mockedTicket = createTicketScenario(mockedEnroolment.id, isRemote);
    const mockedRoom = createRoomScenario();

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockedEnroolment);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockedTicket);

    const promise = bookingService.createBooking(mockedEnroolment.userId, mockedRoom.id);
    expect(promise).rejects.toEqual(requestError(403, 'Forbidden'));
  });

  it('should return request error with status 403 when ticket does not include hotel', async () => {
    const isNotRemote = false;
    const doesNotIncludeHotel = false;
    const mockedEnroolment = createEnrollmentScenario();
    const mockedTicket = createTicketScenario(mockedEnroolment.id, isNotRemote, doesNotIncludeHotel);
    const mockedRoom = createRoomScenario();

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockedEnroolment);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockedTicket);

    const promise = bookingService.createBooking(mockedEnroolment.userId, mockedRoom.id);
    expect(promise).rejects.toEqual(requestError(403, 'Forbidden'));
  });

  it('should return request error with status 403 when ticket has not been paid yet', async () => {
    const isNotRemote = false;
    const includesHotel = true;
    const mockedEnroolment = createEnrollmentScenario();
    const mockedTicket = createTicketScenario(mockedEnroolment.id, isNotRemote, includesHotel, 'RESERVED');
    const mockedRoom = createRoomScenario();

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockedEnroolment);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockedTicket);

    const promise = bookingService.createBooking(mockedEnroolment.userId, mockedRoom.id);
    expect(promise).rejects.toEqual(requestError(403, 'Forbidden'));
  });

  it('should return with booking id', async () => {
    const mockedEnroolment = createEnrollmentScenario();
    const mockedTicket = createTicketScenario(mockedEnroolment.id);
    const mockedRoom = createRoomScenario();
    const mockedBooking = createBookingScenario(mockedEnroolment.id, mockedRoom.id);

    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockedEnroolment);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockedTicket);
    jest.spyOn(bookingRepository, 'checkRoomAvailability').mockResolvedValueOnce(mockedRoom);
    jest.spyOn(bookingRepository, 'createBooking').mockResolvedValueOnce(mockedBooking);

    const promise = await bookingService.createBooking(mockedEnroolment.userId, mockedRoom.id);
    expect(promise).toEqual({
      bookingId: mockedBooking.id,
    });
  });
});
