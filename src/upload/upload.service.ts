// src/upload/upload.service.ts
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadService {
  private readonly maxFileSize: number;
  private readonly allowedTypes: string[];

  constructor(private configService: ConfigService) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });

    // File upload settings
    this.maxFileSize = parseInt(
      this.configService.get<string>('MAX_FILE_SIZE') || '5242880',
    ); // 5MB default
    this.allowedTypes = (
      this.configService.get<string>('ALLOWED_FILE_TYPES') ||
      'image/jpeg,image/png,image/webp'
    ).split(',');
  }

  /**
   * Validate file before upload
   */
  validateFile(file: Express.Multer.File): void {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit`,
      );
    }

    // Check file type
    if (!this.allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedTypes.join(', ')}`,
      );
    }
  }

  /**
   * Upload file to Cloudinary
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'avatars',
  ): Promise<UploadApiResponse> {
    this.validateFile(file);

    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `tutor-support-system/${folder}`,
          resource_type: 'auto',
          transformation: [
            {
              width: 500,
              height: 500,
              crop: 'limit',
              quality: 'auto',
              fetch_format: 'auto',
            },
          ],
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(
              new InternalServerErrorException('Failed to upload file to Cloudinary'),
            );
          } else if (result) {
            resolve(result);
          } else {
            reject(new InternalServerErrorException('Upload failed with no result'));
          }
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Upload avatar specifically
   */
  async uploadAvatar(file: Express.Multer.File, userId: number): Promise<string> {
    const result = await this.uploadFile(file, `avatars/user-${userId}`);
    return result.secure_url;
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new InternalServerErrorException('Failed to delete file from Cloudinary');
    }
  }

  /**
   * Extract public_id from Cloudinary URL
   */
  extractPublicId(url: string): string | null {
    try {
      const parts = url.split('/');
      const fileWithExt = parts[parts.length - 1];
      const publicId = fileWithExt.split('.')[0];
      
      // Get folder path
      const folderIndex = parts.indexOf('tutor-support-system');
      if (folderIndex !== -1) {
        const folderPath = parts.slice(folderIndex, -1).join('/');
        return `${folderPath}/${publicId}`;
      }
      
      return publicId;
    } catch (error) {
      console.error('Error extracting public_id:', error);
      return null;
    }
  }
}
