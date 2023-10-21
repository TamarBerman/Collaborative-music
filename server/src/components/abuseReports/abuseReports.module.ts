import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AbuseReportsController } from './abuseReports.controller';
import { AbuseReportsService } from './abuseReports.service';
import { AbuseReports, AbuseReportsSchema } from 'src/schemas/abuseReport.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AbuseReports.name, schema: AbuseReportsSchema }]),
    AuthModule,
  ],
  controllers: [AbuseReportsController],
  providers: [AbuseReportsService],
})
export class AbuseReportsModule {}
