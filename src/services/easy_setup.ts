import type {
  EasySetupAsyncResponse,
  EasySetupHistoryResponse,
  EasySetupListResponse,
  EasySetupStatusResponse,
} from "@/types";
import { controlIdConfigApi as api } from "@/plugins/api";

class EasySetupService {
  async getDevices(): Promise<EasySetupListResponse> {
    try {
      const response = await api.get("/easy-setup/");
      return response.data as EasySetupListResponse;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async executeSetup(deviceIds?: number[]): Promise<EasySetupAsyncResponse> {
    try {
      const data = deviceIds ? { device_ids: deviceIds } : {};
      const response = await api.post("/easy-setup/", data);
      return response.data as EasySetupAsyncResponse;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getStatus(taskId: string): Promise<EasySetupStatusResponse> {
    try {
      const response = await api.get(`/easy-setup/status/${taskId}/`);
      return response.data as EasySetupStatusResponse;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getHistory(limit = 10): Promise<EasySetupHistoryResponse> {
    try {
      const response = await api.get("/easy-setup/history/", { params: { limit } });
      return response.data as EasySetupHistoryResponse;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default new EasySetupService();
