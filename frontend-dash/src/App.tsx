import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Login } from "@/components/Login"; 

interface WeatherData {
  _id: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  timestamp: string;
}

function App() {
  // Tenta recuperar o token se já estiver salvo
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("gdash_token")
  );
  const [weatherList, setWeatherList] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);

  // Função chamada quando o Login dá certo
  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem("gdash_token", newToken);
    setToken(newToken);
  };

  // Função de Logout
  const handleLogout = () => {
    localStorage.removeItem("gdash_token");
    setToken(null);
  };

  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch("http://localhost:3000/weather");
      const data = await response.json();
      setWeatherList(data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchData();
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [fetchData, token]);

  const current = weatherList[0];

  // --- AQUI ESTÁ A MÁGICA ---
  // Se não tiver token, mostra a tela de Login em vez do Dashboard
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // TELA DE CARREGAMENTO
  if (loading && weatherList.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100">
        <div className="text-xl animate-pulse">Carregando dados... 🌤️</div>
      </div>
    );
  }

  // DASHBOARD
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">GDASH Weather 🌤️</h1>
            <p className="text-zinc-400">Monitoramento Seguro (Admin)</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchData}
              variant="outline"
              className="text-black bg-white hover:bg-zinc-200"
            >
              Atualizar
            </Button>

            {/* BOTÃO DE CSV */}
            <Button
              onClick={() =>
                window.open("http://localhost:3000/weather/export", "_blank")
              }
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              CSV 📥
            </Button>

            {/* BOTÃO DE SAIR */}
            <Button onClick={handleLogout} variant="destructive">
              Sair 🚪
            </Button>
          </div>
        </div>

        {!current ? (
          <div className="text-center text-zinc-500">
            Nenhum dado encontrado. Verifique se o Backend está rodando.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-zinc-900 border-zinc-800 text-white">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-400">
                  Temperatura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {current.temperature.toFixed(1)}°C
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 text-white">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-400">
                  Umidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-400">
                  {current.humidity}%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 text-white">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-400">
                  Vento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-400">
                  {current.windSpeed} km/h
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardHeader>
            <CardTitle>Histórico de Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-900">
                  <TableHead className="text-zinc-400">Data/Hora</TableHead>
                  <TableHead className="text-zinc-400">Temperatura</TableHead>
                  <TableHead className="text-zinc-400">Umidade</TableHead>
                  <TableHead className="text-zinc-400">Vento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weatherList.map((log) => (
                  <TableRow
                    key={log._id}
                    className="border-zinc-800 hover:bg-zinc-800/50"
                  >
                    <TableCell>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{log.temperature.toFixed(1)}°C</TableCell>
                    <TableCell>{log.humidity}%</TableCell>
                    <TableCell>{log.windSpeed} km/h</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
