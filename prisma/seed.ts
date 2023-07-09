import { PrismaClient } from '@prisma/client';

import { movies } from './movies';
const prisma = new PrismaClient();

async function main() {
  const moviesSeed = await prisma.movie.createMany({
    data: movies,
  });

  const moviesCount = movies.length;
  const seatsData = [];

  for (let movieId = 0; movieId < moviesCount; movieId++) {
    for (let seatNumber = 1; seatNumber <= 64; seatNumber++) {
      const seat = {
        movieId: movieId,
        seatNumber: seatNumber,
        book: false,
      };
      seatsData.push(seat);
    }
  }

  console.log(seatsData);

  // const seatsSeed = await prisma.seats.createMany({
  //   data: seatsData,
  // });

  console.log(moviesSeed);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
