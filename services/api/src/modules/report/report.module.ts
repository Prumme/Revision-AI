import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { Report, ReportSchema } from '../../domain/entities/report.entity';
import { MongoReportRepository } from '../../infrastructure/mongo/report/report.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
    UserModule,
  ],
  controllers: [ReportController],
  providers: [
    ReportService,
    {
      provide: 'ReportRepository',
      useClass: MongoReportRepository,
    },
  ],
  exports: [ReportService],
})
export class ReportModule {}
