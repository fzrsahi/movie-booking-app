import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtExceptionFilter } from './auth/exception-filter/jwt-exception.filter';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/v1');
  app.enableCors();

  app.useGlobalFilters(new JwtExceptionFilter());
  await app.listen(PORT, '0.0.0.0');
}
bootstrap();
