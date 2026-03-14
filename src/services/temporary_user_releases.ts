import type {
  BaseResponse,
  PaginatedResponse,
  QueryParams,
  TemporaryUserRelease,
  TemporaryUserReleaseCreatePayload,
} from "@/types";
import { controlIdApi as api } from "@/plugins/api";

class TemporaryUserReleasesService {
  async getTemporaryUserReleases(
    params?: QueryParams,
  ): Promise<PaginatedResponse<TemporaryUserRelease>> {
    try {
      const response = await api.get("/temporary_user_releases/", { params });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createTemporaryUserRelease(
    data: TemporaryUserReleaseCreatePayload,
  ): Promise<BaseResponse<TemporaryUserRelease> | TemporaryUserRelease> {
    try {
      const response = await api.post("/temporary_user_releases/", data);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async cancelTemporaryUserRelease(
    id: number,
  ): Promise<BaseResponse<TemporaryUserRelease> | TemporaryUserRelease> {
    try {
      const response = await api.post(`/temporary_user_releases/${id}/cancel/`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default new TemporaryUserReleasesService();
