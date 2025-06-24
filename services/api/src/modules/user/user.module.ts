import { MailModule } from '@infrastructure/resend/mail.module';
import { MinioModule } from '@modules/minio/minio.module';
import { UserSchema } from '@mongo/user/user.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRepositoryProvider } from '@repositories/user.repository';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MinioModule,
    MailModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepositoryProvider],
  exports: [UserService, UserRepositoryProvider],
})
export class UserModule { }
