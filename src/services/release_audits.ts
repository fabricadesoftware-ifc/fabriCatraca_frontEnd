import type { PaginatedResponse, QueryParams, ReleaseAudit } from "@/types";
import { controlIdApi as api } from "@/plugins/api";

class ReleaseAuditsService {
  async getReleaseAudits(
    params?: QueryParams,
  ): Promise<PaginatedResponse<ReleaseAudit>> {
    try {
      const response = await api.get("/release_audits/", { params });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default new ReleaseAuditsService();
