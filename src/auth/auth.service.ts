// src/auth/auth.service.ts
import { Injectable, Logger, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../core/prisma.service';
import { HcmutSsoService } from '../external/hcmut-sso.service';
import { HcmutDatacoreService } from '../external/hcmut-datacore.service';
import { EmailService } from '../email/email.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private ssoService: HcmutSsoService,
    private datacoreService: HcmutDatacoreService,
    private emailService: EmailService,
  ) {}




//#########################################
//## REGISTER (Create new user locally) ###
//#########################################
	async register(dto: RegisterDto) {
	  // 1. Check if already registered
	  const existingUser = await this.prisma.user.findUnique({
		where: { email: dto.email },
	  });
	  if (existingUser) {
		throw new ConflictException('User already registered in the system');
	  }

	  // 2. Fetch User Info from External System
	  const mockProfile = await this.datacoreService.getMockProfile(dto.email);
	  
	  if (!mockProfile) {
		throw new BadRequestException('User not found in external system');
	  }

	  // 3. Hash Password
	  const hashedPassword = await bcrypt.hash(dto.password, 10);

	  // 4. Create User in Local DB
	  const user = await this.prisma.user.create({
		data: {
		  email: dto.email,
		  password: hashedPassword,
		  fullName: mockProfile.fullName,
		  mssv: mockProfile.userId,
		  role: mockProfile.role,
		  department: mockProfile.department,
		  phoneNumber: mockProfile.phoneNumber,
		  studentClass: mockProfile.studentClass,
		},
	  });

	  // 5. Send Welcome Email
	  this.emailService.sendWelcomeEmail(user.email, {
		fullName: user.fullName,
		email: user.email,
		role: user.role,
		mssv: user.mssv || 'N/A'
	  }).catch(e => this.logger.error(e));

	  return this.generateToken(user);
	}




//##################################################
//## LOGIN (Verify via SSO -> Sync via Datacore) ###
//##################################################
  async login(dto: LoginDto) {
    // 1. Authenticate (Delegate to SSO Service)
    // This will throw UnauthorizedException if password doesn't match
    const ssoResult = await this.ssoService.authenticateUser(dto.email, dto.password);

    // 2. Get DB Object for Token (Already validated by SSO)
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user) {
      throw new BadRequestException('User not found in database');
    }

    return this.generateToken(user);
  }

  private async generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return {
	  code: 200,
      message: 'Login successful',
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        mssv: user.mssv,
      },
      ssoInfo: {
          authenticatedVia: 'HCMUT_SSO',
          dataSyncedFrom: 'HCMUT_DATACORE',
        },
    };
  }
}
