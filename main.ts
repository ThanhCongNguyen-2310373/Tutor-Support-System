// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bật CORS
  app.enableCors({
	origin: true,
	credentials: true
  });

  // Bật Validation Pipe toàn cục
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Loại bỏ các thuộc tính thừa
    transform: true, // Tự động chuyển đổi kiểu dữ liệu (vd: string -> number)
    transformOptions: { enableImplicitConversion: true }, // không có cái này, Nest chỉ chuyển đổi kiểu khi dùng @Type(() => Number) (class-transformer), còn query params thì vẫn giữ nguyên dạng string
  }));

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('Tutor Support System API')
    .setDescription('API Documentation for HCMUT Tutor System Project')
    .setVersion('1.0')
    .addBearerAuth() // Thêm nút "Authorize" cho JWT
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // API sẽ ở /api-docs

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`📚 Swagger API Documentation: http://localhost:${port}/api-docs`);
}
bootstrap();
