import { prisma } from '@/config';

async function getHotels() {
  const result = await prisma.hotel.findMany();
  return result;
}

export const hotelsRepository = {
  getHotels,
};
