import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { Logger } from "@nestjs/common";

@Injectable()
export class AuthService{
    private readonly logger = new Logger(AuthService.name);

    constructor(private databaseService: DatabaseService){}
    

    async login(email: string, password: string){
        if(!email || !password){
            return "Email and password are required";
        }

        const insertQry = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *';
        this.logger.log(`Executing query: ${insertQry} with email: ${email}`);
        const result = await this.databaseService.query(insertQry, [email, password]);

        this.logger.log(`Query result: ${JSON.stringify(result)}`);

        if(result.length === 0){
            return "Invalid email or password";
        }

        return "Login successful";
    }

    async register(email: string, password: string){
        if(!email || !password){
            return "Email and password are required";
        }

        const insertUser = {
            username: email,
            password
        };  

        await this.databaseService.insert('users', insertUser);

        return "User registered successfully";
    }

}