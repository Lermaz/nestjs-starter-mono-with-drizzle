import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ApiErrorResponseDto } from './common/dto/api-error-response.dto';
import { AppConfig } from './core/config/app.config';
import { configureHttpSecurity } from './core/http/configure-http';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app', {
    port: 3000,
    nodeEnv: 'development',
    corsOrigins: [],
    isSwaggerEnabled: true,
  });
  configureHttpSecurity(app, appConfig);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  if (appConfig.isSwaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('NestJS Starter')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig, {
      extraModels: [ApiErrorResponseDto],
    });
    SwaggerModule.setup('docs', app, document);
  }
  await app.listen(appConfig.port);
}
void bootstrap();
