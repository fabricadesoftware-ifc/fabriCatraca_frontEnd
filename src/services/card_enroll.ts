import { usersApi as api } from "@/plugins/api";

class CardEnrollService {
  async enrollCard(enrollmentDeviceId: number): Promise<{ device_id: number; device_name: string; card_value: number }> {
    const response = await api.post("/enroll_card/", { enrollment_device_id: enrollmentDeviceId });
    return response.data;
  }

  async createUserWithCard(data: {
    enrollment_device_id: number;
    name: string;
    phone: string;
    cpf?: string;
    registration?: string;
    email?: string;
    password?: string;
    user_type_id?: number;
    picture_id?: number;
  }): Promise<{ user: any; card: { id: number; value: string } }> {
    const response = await api.post("/create_with_card/", data);
    return response.data;
  }
}

export default new CardEnrollService();
