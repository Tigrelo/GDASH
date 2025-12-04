import { Controller, Get, Param, Query } from "@nestjs/common";
import { PokemonService } from "./pokemon.service";

@Controller("pokemon")
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  findAll(@Query("page") page: string) {
    return this.pokemonService.findAll(+page || 1);
  }

  @Get(":name")
  findOne(@Param("name") name: string) {
    return this.pokemonService.findOne(name);
  }
}
