import { usersApi as api } from "@/plugins/api";

class CardEnrollService {
  async enrollCard(enrollmentDeviceId: number): Promise<{ device_id: number; device_name: string; card_value: number }> {
    const response = await api.post("/users/enroll_card/", { enrollment_device_id: enrollmentDeviceId });
    return response.data;
  }

  async createUserWithCard(data: {
    enrollment_device_id: number;
    name: string;
    phone: string;
    cpf?: string;
    registration?: string;
    start_date?: string | null;
    end_date?: string | null;
    email?: string;
    password?: string;
    user_type_id?: number;
    picture_id?: number;
    card_value?: number | string;
  }): Promise<{
    user: any;
    card: { id: number; value: string };
    visit?: any;
    reused_existing_user?: boolean;
  }> {
    const response = await api.post("/users/create_with_card/", data);
    return response.data;
  }
}

export default new CardEnrollService();
