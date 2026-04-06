import type { Archive } from "@/types";
import { createApi } from "@/plugins/api";

const uploaderApi = createApi("/uploader");

class UploaderService {
  async uploadArchive(file: File): Promise<{ id: number }> {
    const formData = new FormData();
    formData.append("titulo", file.name);
    formData.append("arquivo", file);

    const response = await uploaderApi.post("/archives/", formData);
    return response.data;
  }
}

export default new UploaderService();
