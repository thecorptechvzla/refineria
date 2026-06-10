import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS dinámicos para aceptar Localhost y tu dominio de Vercel
  const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[]; // Elimina valores undefined si la variable no está seteada

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // 3. Pipes y Filtros Globales (Se quedan igual)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  // 4. Configuración del puerto obligatoria para Vercel
  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  
  console.log(`Server running on port ${port}`);
}

bootstrap();