import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrashIcon, PlusIcon, Pencil1Icon } from "@radix-ui/react-icons"; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter, 
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Interface para o dado que vamos editar
interface User {
  _id: string;
  email: string;
  password?: string;
}

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // --- LÓGICA DE READ ---
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:3000/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Erro ao buscar usuários", error);
    }
  };

  // --- LÓGICA DE CREATE ---
  const handleCreate = async () => {
    if (!newEmail || !newPassword) return;
    
    try {
      await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, password: newPassword }),
      });
      setNewEmail("");
      setNewPassword("");
      fetchUsers();
    } catch (error) {
      console.error("Erro ao criar", error);
    }
  };

  // --- LÓGICA DE UPDATE (PATCH) ---
  const handleUpdate = async () => {
    if (!editingUser || !editingUser.email) return;

    try {
      
      await fetch(`http://localhost:3000/users/${editingUser._id}`, {
        method: "PATCH", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: editingUser.email }), // Apenas edita o email
      });
      setIsEditDialogOpen(false); // Fecha o modal
      setEditingUser(null);
      fetchUsers(); // Atualiza a lista
    } catch (error) {
      console.error("Erro ao atualizar", error);
    }
  };


  // --- LÓGICA DE DELETE ---
  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      await fetch(`http://localhost:3000/users/${id}`, {
        method: "DELETE",
      });
      fetchUsers();
    } catch (error) {
      console.error("Erro ao deletar", error);
    }
  };

  // Carrega a lista quando abre o componente
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white border-none">
          Usuários 👥
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gestão de Usuários (CRUD)</DialogTitle>
        </DialogHeader>
        
        {/* Formulário de Cadastro (CREATE) */}
        <div className="flex gap-2 my-4 p-4 bg-zinc-950 rounded-lg border border-zinc-800">
          <Input 
            placeholder="Email" 
            value={newEmail} 
            onChange={e => setNewEmail(e.target.value)}
            className="bg-zinc-900 border-zinc-700 text-white"
          />
          <Input 
            placeholder="Senha" 
            type="password"
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)}
            className="bg-zinc-900 border-zinc-700 text-white"
          />
          <Button onClick={handleCreate} size="icon" className="bg-green-600 hover:bg-green-700">
            <PlusIcon />
          </Button>
        </div>

        {/* Lista de Usuários (READ & DELETE/UPDATE) */}
        <div className="max-h-[300px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-700">
                <TableHead className="text-zinc-400">ID</TableHead>
                <TableHead className="text-zinc-400">Email</TableHead>
                <TableHead className="text-right text-zinc-400">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id} className="border-zinc-800">
                  <TableCell className="font-mono text-xs text-zinc-500">{user._id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    {/* Botão EDITAR (UPDATE) */}
                    <Button 
                      onClick={() => {
                        setEditingUser(user); // Carrega o usuário
                        setIsEditDialogOpen(true); // Abre o modal de edição
                      }} 
                      variant="ghost" 
                      size="icon"
                      className="text-yellow-500 hover:bg-yellow-950"
                    >
                      <Pencil1Icon />
                    </Button>
                    {/* Botão DELETAR (DELETE) */}
                    <Button 
                      onClick={() => handleDelete(user._id)} 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 hover:text-red-400 hover:bg-red-950"
                    >
                      <TrashIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>

      {/* --- (UPDATE) --- */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              value={editingUser?.email || ''}
              onChange={(e) => setEditingUser(u => u ? { ...u, email: e.target.value } : null)}
              className="bg-zinc-950 border-zinc-700 text-white"
            />
            <p className="text-xs text-zinc-500">Nota: Senha não pode ser editada por aqui.</p>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate} className="bg-green-600 hover:bg-green-700">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}