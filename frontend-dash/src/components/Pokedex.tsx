import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function Pokedex() {
  const [pokemons, setPokemons] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [selectedMon, setSelectedMon] = useState<any>(null);
  const [loading, setLoading] = useState(false); // Estado de carregamento para evitar erros

  const fetchPokemons = async (p: number) => {
    try {
      setLoading(true);
      // Adicionamos catch para não quebrar se a API falhar
      const res = await fetch(`http://localhost:3000/pokemon?page=${p}`);
      if (!res.ok) return; // Se der erro 404/500, para aqui

      const data = await res.json();
      // Garante que é um array, mesmo se vier vazio
      setPokemons(data.results || []);
    } catch (error) {
      console.error("Erro ao buscar pokemons", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async (name: string) => {
    try {
      const res = await fetch(`http://localhost:3000/pokemon/${name}`);
      const data = await res.json();
      setSelectedMon(data);
    } catch (error) {
      console.error("Erro ao buscar detalhes", error);
    }
  };

  useEffect(() => {
    fetchPokemons(page);
  }, [page]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
        >
          Pokédex 🎮
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Integração API Externa (Paginação)</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 gap-4 overflow-hidden mt-4">
          {/* Lado Esquerdo: Lista */}
          <div className="w-1/2 flex flex-col gap-2 overflow-y-auto pr-2">
            {loading ? (
              <p className="text-zinc-500 text-center">Carregando...</p>
            ) : (
              
              pokemons?.map((p) => (
                <div
                  key={p.name}
                  onClick={() => fetchDetails(p.name)}
                  className="p-3 bg-zinc-800 rounded cursor-pointer hover:bg-zinc-700 capitalize"
                >
                  {p.name}
                </div>
              ))
            )}

            <div className="flex justify-between mt-2 pt-2 border-t border-zinc-700">
              <Button
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="self-center">Pág {page}</span>
              <Button size="sm" onClick={() => setPage((p) => p + 1)}>
                Próxima
              </Button>
            </div>
          </div>

          {/* Lado Direito: Detalhes */}
          <div className="w-1/2 flex items-center justify-center bg-zinc-950 rounded border border-zinc-800">
            {selectedMon ? (
              <div className="text-center">
                <img
                  src={selectedMon.image}
                  alt={selectedMon.name}
                  className="w-48 h-48 mx-auto"
                />
                <h2 className="text-2xl font-bold capitalize mt-2">
                  {selectedMon.name}
                </h2>
                <div className="flex gap-2 justify-center mt-2">
                  {selectedMon.types?.map((t: any) => (
                    <span
                      key={t}
                      className="px-2 py-1 bg-zinc-800 rounded text-xs uppercase"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-4 text-zinc-400 text-sm">
                  <p>Altura: {selectedMon.height}</p>
                  <p>Peso: {selectedMon.weight}</p>
                </div>
              </div>
            ) : (
              <p className="text-zinc-500">Selecione um Pokémon</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
