import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const isDebug = process.env.LOG_LEVEL === 'debug' || process.env.DEBUG === 'true';

  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: isDebug
      ? ['log', 'error', 'warn', 'debug', 'verbose']
      : ['log', 'error', 'warn'],
  });

  // Request logging middleware (solo si debug está activo)
  if (isDebug) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.debug(`${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
      });
      next();
    });
  }

  // CORS dinámicos
  const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  logger.log(`Server running on port ${port}`);
  if (isDebug) {
    logger.log('Debug mode is ON');
  }
}

bootstrap();
