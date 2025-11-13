// src/external/dto/library-search.dto.ts
import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

/**
 * DTO for searching documents in HCMUT_LIBRARY
 */
export class LibrarySearchDto {
  @IsString()
  query: string; // Từ khóa tìm kiếm

  @IsString()
  @IsOptional()
  category?: string; // Thể loại: 'book', 'paper', 'thesis', 'course_material'

  @IsString()
  @IsOptional()
  subject?: string; // Môn học liên quan

  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}

/**
 * Document info from HCMUT_LIBRARY
 */
export class LibraryDocumentDto {
  id: string;
  title: string;
  author: string;
  category: string;
  subject?: string;
  description?: string;
  publishYear?: number;
  isbn?: string;
  fileUrl?: string;
  coverImageUrl?: string;
  availableCopies?: number;
  totalCopies?: number;
}

/**
 * Response from library search
 */
export class LibrarySearchResponse {
  documents: LibraryDocumentDto[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Request to get document download URL
 */
export class GetDocumentUrlRequest {
  @IsString()
  documentId: string;

  @IsString()
  userId: string; // MSSV/Mã CB để check quyền truy cập
}
