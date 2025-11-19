import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherDocument = HydratedDocument<Weather>;

@Schema({ timestamps: true }) // Isso cria 'createdAt' e 'updatedAt' sozinho!
export class Weather {
  @Prop()
  timestamp: string;

  @Prop()
  latitude: number;

  @Prop()
  longitude: number;

  @Prop()
  temperature: number;

  @Prop()
  humidity: number;

  @Prop()
  windSpeed: number;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);
