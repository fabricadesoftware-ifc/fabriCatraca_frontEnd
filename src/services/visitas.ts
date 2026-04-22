import type { BaseResponse, PaginatedResponse, QueryParams, Visita } from "@/types";
import { usersApi as api } from "@/plugins/api";

class VisitasService {
  async getVisitas(params?: QueryParams): Promise<PaginatedResponse<Visita>> {
    try {
      const response = await api.get("/visitas/", { params });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getVisita(id: number): Promise<BaseResponse<Visita> | Visita> {
    try {
      const response = await api.get(`/visitas/${id}/`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async closeVisita(id: number): Promise<BaseResponse<Visita> | Visita> {
    try {
      const response = await api.post(`/visitas/${id}/close/`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default new VisitasService();
