import type {
  BaseResponse,
  PaginatedResponse,
  QueryParams,
  TemporaryGroupRelease,
  TemporaryGroupReleaseCreatePayload,
} from "@/types";
import { controlIdApi as api } from "@/plugins/api";

class TemporaryGroupReleasesService {
  async getTemporaryGroupReleases(
    params?: QueryParams,
  ): Promise<PaginatedResponse<TemporaryGroupRelease>> {
    try {
      const response = await api.get("/temporary_group_releases/", { params });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createTemporaryGroupRelease(
    data: TemporaryGroupReleaseCreatePayload,
  ): Promise<BaseResponse<TemporaryGroupRelease> | TemporaryGroupRelease> {
    try {
      const response = await api.post("/temporary_group_releases/", data);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async cancelTemporaryGroupRelease(
    id: number,
  ): Promise<BaseResponse<TemporaryGroupRelease> | TemporaryGroupRelease> {
    try {
      const response = await api.post(`/temporary_group_releases/${id}/cancel/`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default new TemporaryGroupReleasesService();
