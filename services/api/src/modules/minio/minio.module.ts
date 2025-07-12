import { Module, Logger, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MinioService } from './minio.service';
import { MinioController } from './minio.controller';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [ConfigModule, forwardRef(() => UserModule)],
  controllers: [MinioController],
  providers: [MinioService, Logger],
  exports: [MinioService],
})
export class MinioModule {}
