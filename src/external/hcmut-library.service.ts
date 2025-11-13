// src/external/hcmut-library.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  LibrarySearchDto,
  LibrarySearchResponse,
  LibraryDocumentDto,
  GetDocumentUrlRequest,
} from './dto/library-search.dto';

/**
 * Service tích hợp với HCMUT_LIBRARY để truy cập tài liệu học tập
 * 
 * HCMUT_LIBRARY là hệ thống thư viện điện tử của trường
 * Cho phép sinh viên và giảng viên:
 * - Tìm kiếm sách, giáo trình, bài báo, luận văn
 * - Download tài liệu số
 * - Chia sẻ tài liệu trong buổi học
 * - Gợi ý tài liệu theo môn học
 * 
 * Hiện tại: MOCK implementation để development
 * Production: Sẽ gọi API thật của HCMUT_LIBRARY
 */
@Injectable()
export class HcmutLibraryService {
  private readonly logger = new Logger(HcmutLibraryService.name);
  private readonly libraryUrl: string;
  private readonly libraryApiKey: string;

  constructor(private configService: ConfigService) {
    this.libraryUrl = this.configService.get<string>('HCMUT_LIBRARY_URL') || 'https://library.hcmut.edu.vn/api';
    this.libraryApiKey = this.configService.get<string>('HCMUT_LIBRARY_API_KEY') || 'mock_api_key';
  }

  /**
   * Tìm kiếm tài liệu trong thư viện
   * 
   * @param searchDto - Query tìm kiếm với filters
   * @returns Danh sách tài liệu phù hợp
   */
  async searchDocuments(searchDto: LibrarySearchDto): Promise<LibrarySearchResponse> {
    this.logger.log(`🔍 [HCMUT_LIBRARY] Searching documents: ${searchDto.query}`);

    try {
      // TODO: Production - Gọi API thật
      // const response = await this.httpService.get(`${this.libraryUrl}/search`, {
      //   params: searchDto,
      //   headers: { 'X-API-Key': this.libraryApiKey }
      // }).toPromise();
      // return response.data;

      // MOCK: Trả về kết quả mock
      return this.mockSearchDocuments(searchDto);
    } catch (error) {
      this.logger.error(`❌ [HCMUT_LIBRARY] Search failed:`, error.message);
      throw error;
    }
  }

  /**
   * Lấy URL download tài liệu
   * 
   * @param request - Document ID và User ID để check quyền
   * @returns URL download (có thể là signed URL với expiry)
   */
  async getDocumentUrl(request: GetDocumentUrlRequest): Promise<string> {
    this.logger.log(`📥 [HCMUT_LIBRARY] Getting document URL: ${request.documentId} for user ${request.userId}`);

    try {
      // TODO: Production - Gọi API thật
      // const response = await this.httpService.post(`${this.libraryUrl}/documents/${request.documentId}/url`, {
      //   userId: request.userId,
      //   apiKey: this.libraryApiKey
      // }).toPromise();
      // return response.data.url;

      // MOCK: Trả về URL mock
      return this.mockGetDocumentUrl(request.documentId);
    } catch (error) {
      this.logger.error(`❌ [HCMUT_LIBRARY] Failed to get document URL:`, error.message);
      throw new NotFoundException('Document not found or access denied');
    }
  }

  /**
   * Gợi ý tài liệu theo chủ đề/môn học
   * 
   * @param topic - Chủ đề hoặc môn học (VD: "Cấu trúc dữ liệu", "Toán cao cấp")
   * @param limit - Số lượng tài liệu gợi ý
   * @returns Danh sách tài liệu được recommend
   */
  async recommendForTopic(topic: string, limit: number = 10): Promise<LibraryDocumentDto[]> {
    this.logger.log(`💡 [HCMUT_LIBRARY] Getting recommendations for topic: ${topic}`);

    try {
      // TODO: Production - Gọi API thật với ML/AI recommendations
      // const response = await this.httpService.get(`${this.libraryUrl}/recommendations`, {
      //   params: { topic, limit },
      //   headers: { 'X-API-Key': this.libraryApiKey }
      // }).toPromise();
      // return response.data;

      // MOCK: Trả về recommendations mock
      return this.mockRecommendForTopic(topic, limit);
    } catch (error) {
      this.logger.error(`❌ [HCMUT_LIBRARY] Failed to get recommendations:`, error.message);
      throw error;
    }
  }

  /**
   * Lấy chi tiết tài liệu theo ID
   * 
   * @param documentId - ID của tài liệu
   * @returns Thông tin chi tiết tài liệu
   */
  async getDocumentById(documentId: string): Promise<LibraryDocumentDto> {
    this.logger.log(`📄 [HCMUT_LIBRARY] Getting document details: ${documentId}`);

    try {
      // TODO: Production - Gọi API thật
      // const response = await this.httpService.get(`${this.libraryUrl}/documents/${documentId}`, {
      //   headers: { 'X-API-Key': this.libraryApiKey }
      // }).toPromise();
      // return response.data;

      // MOCK: Trả về document mock
      return this.mockGetDocumentById(documentId);
    } catch (error) {
      this.logger.error(`❌ [HCMUT_LIBRARY] Failed to get document:`, error.message);
      throw new NotFoundException('Document not found');
    }
  }

  /**
   * Lấy danh sách tài liệu phổ biến
   * 
   * @param category - Thể loại (optional)
   * @param limit - Số lượng
   * @returns Danh sách tài liệu được mượn/download nhiều nhất
   */
  async getPopularDocuments(category?: string, limit: number = 20): Promise<LibraryDocumentDto[]> {
    this.logger.log(`🔥 [HCMUT_LIBRARY] Getting popular documents`);

    try {
      // TODO: Production - Gọi API thật
      // const response = await this.httpService.get(`${this.libraryUrl}/popular`, {
      //   params: { category, limit },
      //   headers: { 'X-API-Key': this.libraryApiKey }
      // }).toPromise();
      // return response.data;

      // MOCK: Trả về popular docs mock
      return this.mockGetPopularDocuments(limit);
    } catch (error) {
      this.logger.error(`❌ [HCMUT_LIBRARY] Failed to get popular documents:`, error.message);
      throw error;
    }
  }

  // ==================== MOCK METHODS (Development only) ====================

  private mockSearchDocuments(searchDto: LibrarySearchDto): LibrarySearchResponse {
    const { query, category, subject, page = 1, limit = 10 } = searchDto;

    // Mock documents dataset
    const allDocuments: LibraryDocumentDto[] = [
      {
        id: 'DOC001',
        title: 'Cấu trúc dữ liệu và Giải thuật - Tập 1',
        author: 'TS. Nguyễn Văn A',
        category: 'course_material',
        subject: 'Data Structures',
        description: 'Giáo trình cơ bản về cấu trúc dữ liệu',
        publishYear: 2023,
        isbn: '978-604-0-00001-1',
        fileUrl: 'https://library.hcmut.edu.vn/files/doc001.pdf',
        coverImageUrl: 'https://library.hcmut.edu.vn/covers/doc001.jpg',
        availableCopies: 5,
        totalCopies: 10,
      },
      {
        id: 'DOC002',
        title: 'Lập trình hướng đối tượng với Java',
        author: 'PGS.TS. Trần Văn B',
        category: 'book',
        subject: 'Object-Oriented Programming',
        description: 'Hướng dẫn toàn diện về OOP',
        publishYear: 2022,
        isbn: '978-604-0-00002-2',
        fileUrl: 'https://library.hcmut.edu.vn/files/doc002.pdf',
        availableCopies: 3,
        totalCopies: 8,
      },
      {
        id: 'DOC003',
        title: 'Toán cao cấp A1 - Giải tích',
        author: 'GS.TS. Lê Văn C',
        category: 'course_material',
        subject: 'Calculus',
        description: 'Giáo trình Toán A1 cho sinh viên năm nhất',
        publishYear: 2023,
        isbn: '978-604-0-00003-3',
        fileUrl: 'https://library.hcmut.edu.vn/files/doc003.pdf',
        availableCopies: 8,
        totalCopies: 15,
      },
      {
        id: 'DOC004',
        title: 'Cơ sở dữ liệu quan hệ',
        author: 'TS. Phạm Thị D',
        category: 'course_material',
        subject: 'Database Systems',
        description: 'Nguyên lý thiết kế và quản trị CSDL',
        publishYear: 2023,
        isbn: '978-604-0-00004-4',
        fileUrl: 'https://library.hcmut.edu.vn/files/doc004.pdf',
        availableCopies: 6,
        totalCopies: 12,
      },
      {
        id: 'DOC005',
        title: 'Công nghệ phần mềm hiện đại',
        author: 'PGS.TS. Hoàng Văn E',
        category: 'book',
        subject: 'Software Engineering',
        description: 'Agile, DevOps, CI/CD trong thực tế',
        publishYear: 2024,
        isbn: '978-604-0-00005-5',
        fileUrl: 'https://library.hcmut.edu.vn/files/doc005.pdf',
        availableCopies: 4,
        totalCopies: 10,
      },
    ];

    // Filter by query
    let filtered = allDocuments.filter(doc =>
      doc.title.toLowerCase().includes(query.toLowerCase()) ||
      doc.author.toLowerCase().includes(query.toLowerCase()) ||
      doc.description?.toLowerCase().includes(query.toLowerCase())
    );

    // Filter by category
    if (category) {
      filtered = filtered.filter(doc => doc.category === category);
    }

    // Filter by subject
    if (subject) {
      filtered = filtered.filter(doc =>
        doc.subject?.toLowerCase().includes(subject.toLowerCase())
      );
    }

    // Pagination
    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const documents = filtered.slice(startIndex, endIndex);

    this.logger.log(`✅ [HCMUT_LIBRARY MOCK] Found ${total} documents, returning ${documents.length}`);

    return {
      documents,
      total,
      page,
      limit,
    };
  }

  private mockGetDocumentUrl(documentId: string): string {
    // MOCK: Trả về signed URL (giả lập)
    const baseUrl = 'https://library.hcmut.edu.vn/download';
    const token = Buffer.from(`${documentId}:${Date.now()}`).toString('base64');
    const expiryMinutes = 60;

    const url = `${baseUrl}/${documentId}?token=${token}&expires=${expiryMinutes}`;

    this.logger.log(`✅ [HCMUT_LIBRARY MOCK] Generated download URL for ${documentId}`);
    return url;
  }

  private mockRecommendForTopic(topic: string, limit: number): LibraryDocumentDto[] {
    // MOCK: Recommendations dựa trên topic
    const recommendations: LibraryDocumentDto[] = [
      {
        id: 'REC001',
        title: `Tài liệu nâng cao về ${topic}`,
        author: 'Various Authors',
        category: 'course_material',
        subject: topic,
        description: `Tài liệu được recommend cho chủ đề ${topic}`,
        publishYear: 2024,
        availableCopies: 10,
        totalCopies: 10,
      },
      {
        id: 'REC002',
        title: `Bài tập thực hành ${topic}`,
        author: 'HCMUT Teaching Team',
        category: 'course_material',
        subject: topic,
        description: `Bài tập và ví dụ minh họa cho ${topic}`,
        publishYear: 2023,
        availableCopies: 15,
        totalCopies: 15,
      },
    ];

    const result = recommendations.slice(0, limit);
    this.logger.log(`✅ [HCMUT_LIBRARY MOCK] Recommended ${result.length} documents for ${topic}`);
    return result;
  }

  private mockGetDocumentById(documentId: string): LibraryDocumentDto {
    return {
      id: documentId,
      title: `Document ${documentId}`,
      author: 'Mock Author',
      category: 'book',
      subject: 'General',
      description: 'This is a mock document for testing',
      publishYear: 2024,
      isbn: `978-604-0-${documentId}`,
      fileUrl: `https://library.hcmut.edu.vn/files/${documentId}.pdf`,
      availableCopies: 5,
      totalCopies: 10,
    };
  }

  private mockGetPopularDocuments(limit: number): LibraryDocumentDto[] {
    const popular: LibraryDocumentDto[] = [
      {
        id: 'POP001',
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        category: 'book',
        subject: 'Software Engineering',
        description: 'Best practices for writing clean, maintainable code',
        publishYear: 2008,
        availableCopies: 2,
        totalCopies: 5,
      },
      {
        id: 'POP002',
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen',
        category: 'book',
        subject: 'Algorithms',
        description: 'The comprehensive guide to algorithms',
        publishYear: 2009,
        availableCopies: 1,
        totalCopies: 3,
      },
    ];

    const result = popular.slice(0, limit);
    this.logger.log(`✅ [HCMUT_LIBRARY MOCK] Retrieved ${result.length} popular documents`);
    return result;
  }

  /**
   * Health check - Kiểm tra LIBRARY service có hoạt động không
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      // TODO: Production - Ping LIBRARY API
      // await this.httpService.get(`${this.libraryUrl}/health`).toPromise();

      return {
        status: 'healthy',
        message: 'HCMUT_LIBRARY service is available (MOCK)'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'HCMUT_LIBRARY service is unavailable'
      };
    }
  }
}
