// src/management/management.module.ts
import { Module } from '@nestjs/common';
import { ManagementController } from './management.controller';
import { ManagementService } from './management.service';
import { PrismaService } from '../core/prisma.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [ManagementController],
  providers: [ManagementService, PrismaService],
  exports: [ManagementService],
})
export class ManagementModule {}
