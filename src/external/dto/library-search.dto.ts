// src/external/dto/library-search.dto.ts
import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class LibrarySearchDto {
  @ApiPropertyOptional({ 
    description: 'Search term (title, author, ISBN)',
    example: 'Clean Code' 
  })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiPropertyOptional({ 
    description: 'Category filter (e.g., book, magazine)',
    example: 'book' 
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ 
    description: 'Subject filter (e.g., Computers, Science, Fiction)',
    example: 'Computers' 
  })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional({ 
    description: 'Page number (starts at 1)',
    default: 1,
    minimum: 1
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Items per page',
    default: 10,
    maximum: 40
  })
  @IsInt()
  @Min(1)
  @Max(40)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
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
