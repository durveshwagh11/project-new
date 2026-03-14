import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService{
    

    login(email: string, password: string){
        if(!email || !password){
            return "Email and password are required";
        }

        return `Logged in with email: ${email} and password: ${password}`;

    }

}