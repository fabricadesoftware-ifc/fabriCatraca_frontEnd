import type { EasySetupListResponse, EasySetupResponse } from "@/types";
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

  async executeSetup(deviceIds?: number[]): Promise<EasySetupResponse> {
    try {
      const data = deviceIds ? { device_ids: deviceIds } : {};
      const response = await api.post("/easy-setup/", data, {
        timeout: 700_000, // 5 minutos — operação pode demorar
      });
      return response.data as EasySetupResponse;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default new EasySetupService();
