export interface JwtUserData {
    sub: number;
    jti: string;
    phone: string;
    type: 'access' | 'refresh';
}
