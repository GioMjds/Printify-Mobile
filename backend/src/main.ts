import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const expoOrigin = process.env.EXPO_CLIENT_URL;

  app.enableCors({
    origin: expoOrigin,
    credentials: true
  });

  app.setGlobalPrefix('api');
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  const port = process.env.PORT;
  await app.listen(Number(port));
}
bootstrap();
