import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = new ConfigService();
  const PORT = configService.get('PORT') || 3000;
  const SWAGGER_PATH = configService.get('SWAGGER_PATH');
  const config = new DocumentBuilder()
    .setTitle('MOvie Booking APP REST API Documentation')
    .setDescription('fazrul anugrah sahi backend portofolio')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter Jwt Token',
        in: 'header',
      },
      'JWTAUTH',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  await app.listen(PORT, '0.0.0.0');
  console.log(
    '======================================================================',
  );
  console.log(`Server Berjalan DI : http://localhost:${PORT}/`);
  console.log(`Swagger Berjalan DI : http://localhost:${PORT}/${SWAGGER_PATH}`);
  console.log(
    '======================================================================',
  );
}
bootstrap();
