// Business logic for validating credentials

export class AuthService {
    private readonly USERNAME = "admin";
    private readonly PASSWORD = "1234"; // plain text for demo

    validateCredentials(username: string, password: string): boolean {
        return username === this.USERNAME && password === this.PASSWORD;
    }
}
