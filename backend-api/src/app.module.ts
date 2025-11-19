import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WeatherModule } from './weather/weather.module'; // <--- Importante!

@Module({
  imports: [
    // Conexão com o Banco
    MongooseModule.forRoot(
      'mongodb://root:root123@localhost:27017/gdash_db?authSource=admin',
    ),

    // Módulos da Aplicação
    WeatherModule, // <--- Adiciona esta linha aqui!
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
