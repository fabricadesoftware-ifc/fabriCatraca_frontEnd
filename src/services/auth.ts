import type { getToken, User } from "@/types";
import { authApi, usersApi } from "@/plugins/api";

interface TokenResponse {
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

  async refreshToken(): Promise<string> {
    try {
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await authApi.post("refresh/", { refresh: refreshToken });
      const { access } = response.data as Pick<TokenResponse, "access">;

      localStorage.setItem("access_token", access);

      return access;
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  }
}

export default new AuthService();
