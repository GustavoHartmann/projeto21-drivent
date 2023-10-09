import faker from '@faker-js/faker';
import { Address, Booking, Enrollment, Room, Ticket, TicketStatus, TicketType } from '@prisma/client';
import { prisma } from '@/config';

export async function createBooking(userId: number, roomId: number) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

export function createEnrollmentScenario() {
  const genericId = faker.datatype.number();
  const genericPastDate = faker.date.past();

  const mockedEnrollment: Enrollment & {
    Address: Address[];
  } = {
    id: genericId,
    name: faker.name.firstName(),
    cpf: faker.finance.account(11),
    birthday: genericPastDate,
    phone: faker.phone.phoneNumber(),
    userId: genericId,
    createdAt: genericPastDate,
    updatedAt: genericPastDate,
    Address: [
      {
        id: genericId,
        cep: faker.address.zipCode(),
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.state(),
        number: faker.address.buildingNumber(),
        neighborhood: faker.name.findName(),
        addressDetail: faker.address.streetAddress(),
        enrollmentId: genericId,
        createdAt: genericPastDate,
        updatedAt: genericPastDate,
      },
    ],
  };

  return mockedEnrollment;
}

export function createTicketScenario(
  mockedEnrollmentId: number,
  isRemote?: boolean,
  includesHotel?: boolean,
  ticketStatus?: string,
) {
  const genericId = faker.datatype.number();
  const genericPastDate = faker.date.past();

  const mockedTicket: Ticket & {
    TicketType: TicketType;
  } = {
    id: genericId,
    ticketTypeId: genericId,
    enrollmentId: mockedEnrollmentId,
    status: ticketStatus === 'RESERVED' ? TicketStatus.RESERVED : TicketStatus.PAID,
    createdAt: genericPastDate,
    updatedAt: genericPastDate,
    TicketType: {
      id: genericId,
      name: faker.company.companyName(),
      price: Number(faker.commerce.price()),
      isRemote: isRemote === undefined ? false : isRemote,
      includesHotel: includesHotel === undefined ? true : includesHotel,
      createdAt: genericPastDate,
      updatedAt: genericPastDate,
    },
  };

  return mockedTicket;
}

export function createRoomScenario(capacity?: number) {
  const genericId = faker.datatype.number();
  const genericPastDate = faker.date.past();

  const mockedRoom: Room & {
    Booking: Booking[];
  } = {
    id: genericId,
    name: faker.address.buildingNumber(),
    capacity: capacity !== undefined ? capacity : 3,
    hotelId: genericId,
    createdAt: genericPastDate,
    updatedAt: genericPastDate,
    Booking: [],
  };

  return mockedRoom;
}

export function createBookingScenario(mockedEnrollmentId: number, mockedRoomId: number) {
  const genericId = faker.datatype.number();
  const genericPastDate = faker.date.past();

  const mockedBooking: Booking = {
    id: genericId,
    userId: mockedEnrollmentId,
    roomId: mockedRoomId,
    createdAt: genericPastDate,
    updatedAt: genericPastDate,
  };

  return mockedBooking;
}

export function createBookingWithRoomScenario() {
  const genericId = faker.datatype.number();
  const genericPastDate = faker.date.past();

  const mockedBookingWithRoom: Booking & {
    Room: Room;
  } = {
    id: genericId,
    userId: genericId,
    roomId: genericId,
    createdAt: genericPastDate,
    updatedAt: genericPastDate,
    Room: {
      id: genericId,
      name: faker.address.buildingNumber(),
      capacity: 3,
      hotelId: genericId,
      createdAt: genericPastDate,
      updatedAt: genericPastDate,
    },
  };

  return mockedBookingWithRoom;
}
