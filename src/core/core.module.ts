// src/core/core.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Biến thành module Toàn cục
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Export để module khác dùng
})
export class CoreModule {}
