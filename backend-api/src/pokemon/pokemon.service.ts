import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class PokemonService {
  constructor(private readonly httpService: HttpService) {}

  async findAll(page: number = 1) {
    const limit = 20;
    const offset = (page - 1) * limit;

    // ADICIONEI 'as any' PARA O TYPESCRIPT NÃO RECLAMAR
    const response: any = await firstValueFrom(
      this.httpService.get(
        `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
      )
    );

    return {
      results: response.data.results,
      next: page + 1,
      previous: page > 1 ? page - 1 : null,
      total: response.data.count,
    };
  }

  async findOne(name: string) {
    // ADICIONEI 'as any' AQUI TAMBÉM
    const response: any = await firstValueFrom(
      this.httpService.get(`https://pokeapi.co/api/v2/pokemon/${name}`)
    );

    const data = response.data;

    return {
      id: data.id,
      name: data.name,
      height: data.height,
      weight: data.weight,
      types: data.types.map((t: any) => t.type.name),
      image: data.sprites.front_default,
    };
  }
}
