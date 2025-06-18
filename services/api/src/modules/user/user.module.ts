import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSchema } from '@mongo/user/user.schema';
import { UserRepositoryProvider } from '@repositories/user.repository';
import { MinioModule } from '@modules/minio/minio.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MinioModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepositoryProvider],
  exports: [UserService],
})
export class UserModule {}
