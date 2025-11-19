import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { Weather, WeatherDocument } from './entities/weather.entity';

@Injectable()
export class WeatherService {
  // Injeção de Dependência do Modelo Mongoose
  constructor(
    @InjectModel(Weather.name) private weatherModel: Model<WeatherDocument>,
  ) {}

  async create(createWeatherDto: CreateWeatherDto) {
    const createdWeather = new this.weatherModel(createWeatherDto);
    return createdWeather.save();
  }

  async findAll() {
    // Busca os últimos 100 registros, ordenados do mais novo para o mais velho
    return this.weatherModel.find().sort({ createdAt: -1 }).limit(100).exec();
  }
}
