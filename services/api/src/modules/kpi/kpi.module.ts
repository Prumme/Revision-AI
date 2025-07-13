import { Module } from '@nestjs/common';
import { KpiController } from './kpi.controller';
import { KpiService } from './kpi.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionSchema } from '../../infrastructure/mongo/session/session.schema';
import { KpiRepositoryProvider } from '@repositories/kpi.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Session', schema: SessionSchema }]),
  ],
  controllers: [KpiController],
  providers: [KpiService, KpiRepositoryProvider],
  exports: [KpiService],
})
export class KpiModule {}
