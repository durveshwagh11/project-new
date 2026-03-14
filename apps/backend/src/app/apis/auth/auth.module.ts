import { Module } from "@nestjs/common";
import { AuthService } from "../../shared/auth/auth.service";
import { AuthController } from "./auth.controller";
import { DatabaseModule } from "../../shared/database/database.module";



@Module({
    imports: [DatabaseModule],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule{}