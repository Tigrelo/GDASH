import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import { User, UserDocument } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // 1. Seed: Cria Admin se o banco estiver vazio
  async onModuleInit() {
    const count = await this.userModel.countDocuments();
    if (count === 0) {
      console.log("🌱 Banco vazio. Criando usuário ADMIN padrão...");
      const passwordHash = await bcrypt.hash("123456", 10);

      await this.userModel.create({
        email: "admin@example.com",
        password: passwordHash,
      });
      console.log("✅ Usuário ADMIN criado: admin@example.com / 123456");
    }
  }

  // 2. Criar novo usuário (Hash na senha)
  async create(createUserDto: CreateUserDto) {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(createUserDto.password, salt);

    const newUser = new this.userModel({
      ...createUserDto,
      password: hash,
    });
    return newUser.save();
  }

  findAll() {
    return this.userModel.find().exec();
  }

  // 3. Buscar por ID (Mongo usa String)
  findOne(id: string) {
    return this.userModel.findById(id).exec();
  }

  // 4. Buscar por Email (Para o Login)
  // Removemos a tipagem explicita para o TS não reclamar de 'null'
  async findOneByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  // 5. Update (Faltava este método!)
  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  // 6. Remove (Faltava este método!)
  remove(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
