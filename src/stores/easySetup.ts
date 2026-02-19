import type { EasySetupDevice, EasySetupDeviceResult, EasySetupResponse } from "@/types";
import { defineStore } from "pinia";
import { ref } from "vue";
import { EasySetupService } from "@/services";

export const useEasySetupStore = defineStore("easySetup", () => {
  const devices = ref<EasySetupDevice[]>([]);
  const results = ref<EasySetupDeviceResult[]>([]);
  const response = ref<EasySetupResponse | null>(null);
  const loading = ref(false);
  const executing = ref(false);
  const error = ref<string | null>(null);

  const loadDevices = async () => {
    loading.value = true;
    error.value = null;
    try {
      const data = await EasySetupService.getDevices();
      devices.value = data.devices;
    } catch (err: any) {
      error.value = err?.response?.data?.error || "Erro ao carregar dispositivos";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const executeSetup = async (deviceIds: number[]) => {
    executing.value = true;
    error.value = null;
    results.value = [];
    response.value = null;
    try {
      const data = await EasySetupService.executeSetup(deviceIds);
      response.value = data;
      results.value = data.results;
      return data;
    } catch (err: any) {
      error.value = err?.response?.data?.error || "Erro ao executar Easy Setup";
      throw err;
    } finally {
      executing.value = false;
    }
  };

  const reset = () => {
    devices.value = [];
    results.value = [];
    response.value = null;
    error.value = null;
    loading.value = false;
    executing.value = false;
  };

  return {
    devices,
    results,
    response,
    loading,
    executing,
    error,
    loadDevices,
    executeSetup,
    reset,
  };
});
