import { Module } from '@nestjs/common';
import { KpiController } from './kpi.controller';
import { KpiService } from './kpi.service';
import { KpiRepository } from '../../infrastructure/mongo/kpi/kpi.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionSchema } from '../../infrastructure/mongo/session/session.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Session', schema: SessionSchema }]),
  ],
  controllers: [KpiController],
  providers: [
    KpiService,
    { provide: 'KpiRepository', useClass: KpiRepository },
  ],
  exports: [KpiService],
})
export class KpiModule {}

