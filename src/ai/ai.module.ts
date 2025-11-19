import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIMatchingService } from './ai-matching.service';
import { ChatbotService } from './chatbot.service';
// import { ContentGeneratorService } from './content-generator.service';
import { AIController } from './ai.controller';
import { CoreModule } from '../core/core.module';

@Module({
  imports: [CoreModule, ConfigModule],
  controllers: [AIController],
  providers: [AIMatchingService, ChatbotService], // ContentGeneratorService to be added in Week 4
  exports: [AIMatchingService, ChatbotService],
})
export class AIModule {}
