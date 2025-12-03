import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Parser } from 'json2csv';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { Weather, WeatherDocument } from './entities/weather.entity';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(Weather.name) private weatherModel: Model<WeatherDocument>,
  ) {}

  async create(createWeatherDto: CreateWeatherDto) {
    const createdWeather = new this.weatherModel(createWeatherDto);
    return createdWeather.save();
  }

  async findAll() {
    return this.weatherModel.find().sort({ createdAt: -1 }).limit(100).exec();
  }

  async exportToCsv() {
  
    const data: any = await this.weatherModel
      .find()
      .sort({ createdAt: -1 })
      .limit(500)
      .exec();
    const fields = ['timestamp', 'temperature', 'humidity', 'windSpeed'];
    const opts = { fields };

    try {
      // O 'any' no Parser evita erros de lint sobre construtor inseguro
      const parser = new Parser(opts);
      return parser.parse(data);
    } catch (err) {
      console.error(err);
      throw new Error('Erro ao gerar CSV');
    }
  }
}
