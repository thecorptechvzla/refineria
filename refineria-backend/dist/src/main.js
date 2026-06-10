"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const isDebug = process.env.LOG_LEVEL === 'debug' || process.env.DEBUG === 'true';
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: isDebug
            ? ['log', 'error', 'warn', 'debug', 'verbose']
            : ['log', 'error', 'warn'],
    });
    if (isDebug) {
        app.use((req, res, next) => {
            const start = Date.now();
            res.on('finish', () => {
                const duration = Date.now() - start;
                logger.debug(`${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
            });
            next();
        });
    }
    const allowedOrigins = [
        'http://localhost:3000',
        process.env.FRONTEND_URL,
    ].filter(Boolean);
    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const port = process.env.PORT ?? 4000;
    await app.listen(port);
    logger.log(`Server running on port ${port}`);
    if (isDebug) {
        logger.log('Debug mode is ON');
    }
}
bootstrap();
//# sourceMappingURL=main.js.map