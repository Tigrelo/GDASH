import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    // Isso diz ao TypeScript para confiar que o objeto tem senha e métodos do Mongoose.
    const user: any = await this.usersService.findOneByEmail(email);

    // Se usuário existe E a senha bate com o hash
    if (user && (await bcrypt.compare(pass, user.password))) {
      // O 'toObject' existe porque é um documento do Mongoose
      const { password, ...result } = user.toObject ? user.toObject() : user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
