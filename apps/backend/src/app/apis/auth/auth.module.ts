import { Module } from "@nestjs/common";
import { AuthService } from "../../shared/auth/auth.service";
import { AuthController } from "./auth.controller";


@Module({
    imports: [],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule{}