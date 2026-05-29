import type { getToken, User } from "@/types";
import { authApi, usersApi } from "@/plugins/api";

interface TokenResponse {
  access: string;
  refresh: string;
}

export interface IToken {
  access: string;
  refresh: string;
}

class AuthService {
  async getToken(user: getToken): Promise<TokenResponse> {
    try {
      const response = await authApi.post("token/", user);
      return response.data as TokenResponse;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getMe(): Promise<User> {
    try {
      const response = await usersApi.get("/users/me/");
      return response.data as User;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async refreshToken(token: string) {
    const { data } = await authApi.post("/refresh/", { refresh: token });
    return data as IToken;
  }
}

export default new AuthService();
