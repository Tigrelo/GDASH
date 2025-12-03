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
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("gdash_token")
  );
  const [weatherList, setWeatherList] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem("gdash_token", newToken);
    setToken(newToken);
  };

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

  // --- FUNÇÃO: GERA O INSIGHT DA IA ---
  const getInsight = (temp: number, humidity: number) => {
    if (temp > 30) return "🔥 Alerta de Calor: Hidrate-se e evite sol direto.";
    if (temp < 15) return "❄️ Frente Fria: Recomenda-se uso de agasalhos térmicos.";
    if (humidity < 30) return "🌵 Ar Seco: Evite exercícios físicos intensos ao ar livre.";
    if (humidity > 80) return "💧 Umidade Alta: Possibilidade de chuva nas próximas horas.";
    return "✨ Condições Ideais: Clima agradável para atividades externas e geração de energia.";
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (loading && weatherList.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100">
        <div className="text-xl animate-pulse">Carregando dados... 🌤️</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">GDASH Tempo🌤️</h1>
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

            <Button
              onClick={() =>
                window.open("http://localhost:3000/weather/export", "_blank")
              }
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              CSV 📥
            </Button>

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
            {/* Cards de Dados */}
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

            {/* --- NOVO CARD DE INSIGHT (Ocupa as 3 colunas) --- */}
            <Card className="bg-zinc-900 border-zinc-800 text-white md:col-span-3 border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-purple-400 flex items-center gap-2">
                  🤖 Insight IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium">
                  {getInsight(current.temperature, current.humidity)}
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  Análise gerada automaticamente com base nos dados atuais.
                </p>
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