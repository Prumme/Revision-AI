import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MinioService } from './minio.service';
import { MinioController } from './minio.controller';

@Module({
  imports: [ConfigModule],
  controllers: [MinioController],
  providers: [MinioService, Logger],
  exports: [MinioService],
})
export class MinioModule {}
