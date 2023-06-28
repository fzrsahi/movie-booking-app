import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MovieModule } from './movie/movie.module';
import { PrismaService } from './prisma/prisma.service';

import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { BalanceModule } from './balance/balance.module';

@Module({
  imports: [
    MovieModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BalanceModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
