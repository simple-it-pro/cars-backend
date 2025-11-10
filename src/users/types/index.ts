export interface JwtUserData {
    sub: string;
    jti: string;
    phone: string;
    type: 'access' | 'refresh';
}
