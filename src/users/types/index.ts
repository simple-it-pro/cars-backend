export interface JwtUserData {
  sub: number;
  phone: string;
  type: 'access' | 'refresh';
}
