import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle("GDASH API")
    .setDescription("Documentação da API do Desafio GDASH")
    .setVersion("1.0")
    .addTag("weather")
    .addTag("users")
    .addTag("auth")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);
  // ----------------------------------------------

  await app.listen(3000);
}
bootstrap();
