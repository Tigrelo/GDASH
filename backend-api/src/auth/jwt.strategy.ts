import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: "SEGREDO_SUPER_SECRETO_GDASH", // Tem de ser igual ao do Module
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
