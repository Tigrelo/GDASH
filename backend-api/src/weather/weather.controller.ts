import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post()
  create(@Body() createWeatherDto: CreateWeatherDto) {
    return this.weatherService.create(createWeatherDto);
  }

  @Get()
  findAll() {
    return this.weatherService.findAll();
  }

  @Get('export')
  async export(@Res() res: Response) {
    const csv = await this.weatherService.exportToCsv();

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=clima_log.csv');
    return res.send(csv);
  }
}
