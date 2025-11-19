import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Conectando ao MongoDB rodando no Docker (localhost porta 27017)
    MongooseModule.forRoot(
      'mongodb://root:root123@localhost:27017/gdash_db?authSource=admin',
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
