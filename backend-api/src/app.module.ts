import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { WeatherModule } from "./weather/weather.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { PokemonModule } from "./pokemon/pokemon.module";


const mongoHost = process.env.MONGO_HOST || "localhost";

@Module({
  imports: [
    // Usamos a variável mongoHost dentro da string de conexão
    MongooseModule.forRoot(
      `mongodb://root:root123@${mongoHost}:27017/gdash_db?authSource=admin`
    ),
    WeatherModule,
    UsersModule,
    AuthModule,
    PokemonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
