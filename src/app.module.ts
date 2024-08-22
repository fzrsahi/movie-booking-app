import { Module } from '@nestjs/common';
import { MovieModule } from './movie/movie.module';
import { PrismaService } from './prisma/prisma.service';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BalanceModule } from './balance/balance.module';
import { TicketModule } from './ticket/ticket.module';
import { OrdersModule } from './orders/orders.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    MovieModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    BalanceModule,
    TicketModule,
    OrdersModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('RATE_LIMITER_TTL'),
          limit: config.get('RATE_LIMITER_LIMIT'),
        },
      ],
    }),
  ],
  controllers: [],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
