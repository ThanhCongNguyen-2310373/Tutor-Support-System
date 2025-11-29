// src/external/external.module.ts
import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { HcmutSsoService } from './hcmut-sso.service';
import { HcmutDatacoreService } from './hcmut-datacore.service';
import { HcmutLibraryService } from './hcmut-library.service';
import { ExternalController } from './external.controller';
import { HttpModule } from '@nestjs/axios';

/**
 * External Module - Tích hợp với các hệ thống bên ngoài của HCMUT
 * 
 * Module này cung cấp các services để tích hợp với:
 * 1. HCMUT_SSO - Xác thực tập trung
 * 2. HCMUT_DATACORE - Đồng bộ dữ liệu người dùng
 * 3. HCMUT_LIBRARY - Truy cập thư viện điện tử
 * 
 * Tất cả services đều được export để các module khác sử dụng
 * (VD: AuthModule dùng HcmutSsoService, HcmutDatacoreService)
 */
@Module({
  imports: [
    CoreModule,
    HttpModule,
  ],
  controllers: [ExternalController],
  providers: [
    HcmutSsoService,
    HcmutDatacoreService,
    HcmutLibraryService,
  ],
  exports: [
    HcmutSsoService,
    HcmutDatacoreService,
    HcmutLibraryService,
  ],
})
export class ExternalModule {}
