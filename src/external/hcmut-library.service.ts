// src/external/hcmut-library.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  LibrarySearchDto,
  LibrarySearchResponse,
  LibraryDocumentDto,
} from './dto/library-search.dto';

@Injectable()
export class HcmutLibraryService {
  private readonly logger = new Logger(HcmutLibraryService.name);
  private readonly googleBooksApiUrl = 'https://www.googleapis.com/books/v1/volumes';
  private readonly apiKey: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('GOOGLE_BOOKS_API_KEY') || '';
  }

  /**
   * Unified method for Browsing AND Searching
   */
  async getBooks(searchDto: LibrarySearchDto): Promise<LibrarySearchResponse> {
    const { query, subject, page = 1, limit = 10 } = searchDto;
    
    // 1. Handle "Default View" (User just opened the library)
    // If no query/topic is provided, default to engineering/tech books
    let qParam = query || '';
    
    if (!qParam && !subject) {
      qParam = 'subject:computers'; // Default content for empty search
    }

    // 2. Add Subject filter if selected (e.g., user clicked "Physics" category)
    if (subject) {
      qParam += `+subject:${subject}`;
    }

    // 3. Pagination Logic
    const startIndex = (page - 1) * limit;

    try {
      const params: any = {
        q: qParam,
        startIndex,
        maxResults: limit,
        printType: 'all', // Include magazines/books
      };
      if (this.apiKey) params.key = this.apiKey;

      const { data } = await firstValueFrom(
        this.httpService.get(this.googleBooksApiUrl, { params }),
      );

      const items = data.items || [];
      const documents = items.map(this.mapGoogleBookToDto);

      return {
        documents,
        total: data.totalItems || 0,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`❌ [GOOGLE_BOOKS] Error: ${error.message}`);
      return { documents: [], total: 0, page, limit };
    }
  }

  // Helper: Convert Google's messy JSON to your clean DTO
  private mapGoogleBookToDto(item: any): LibraryDocumentDto {
    const info = item.volumeInfo || {};
    const access = item.accessInfo || {};

    // Logic: Get the best available reading link
    let url = access.webReaderLink; 
    if (access.pdf?.isAvailable && access.pdf?.acsTokenLink) {
        url = access.pdf.acsTokenLink;
    } else if (info.previewLink) {
        url = info.previewLink;
    }

    return {
      id: item.id,
      title: info.title || 'No Title',
      author: info.authors ? info.authors.join(', ') : 'Unknown',
      category: 'book',
      subject: info.categories ? info.categories[0] : 'General',
      description: info.description ? info.description.substring(0, 300) + '...' : '',
      publishYear: info.publishedDate ? parseInt(info.publishedDate.substring(0, 4)) : undefined,
      isbn: info.industryIdentifiers?.[0]?.identifier,
      coverImageUrl: info.imageLinks?.thumbnail?.replace('http:', 'https:'), // Force HTTPS
      fileUrl: url, // <--- The download/read link is ready here!
      availableCopies: (access.viewability !== 'NO_PAGES') ? 999 : 0,
      totalCopies: 0,
    };
  }
}