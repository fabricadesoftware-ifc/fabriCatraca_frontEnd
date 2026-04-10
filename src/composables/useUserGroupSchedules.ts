import type { IfcGroupSchedule } from "@/services/ifc_schedules";
import ifcSchedulesService from "@/services/ifc_schedules";
import { ref, watch, type Ref } from "vue";

export function useUserGroupSchedules(
  selectedGroupNames: Ref<string[]>,
  isOpenRef: Ref<boolean>,
  tabRef: Ref<string>,
) {
  const schedulesLoading = ref(false);
  const schedulesError = ref("");
  const groupSchedules = ref<IfcGroupSchedule[]>([]);
  const lastScheduleKey = ref("");

  function resetSchedules() {
    groupSchedules.value = [];
    schedulesError.value = "";
    lastScheduleKey.value = "";
  }

  async function loadGroupSchedules(force = false) {
    const groupNames = selectedGroupNames.value;
    const scheduleKey = groupNames.join("|");

    if (!isOpenRef.value || tabRef.value !== "horarios") {
      return;
    }

    if (groupNames.length === 0) {
      resetSchedules();
      return;
    }

    if (!force && scheduleKey === lastScheduleKey.value && groupSchedules.value.length > 0) {
      return;
    }

    schedulesLoading.value = true;
    schedulesError.value = "";

    try {
      groupSchedules.value = await ifcSchedulesService.getSchedulesByGroupNames(groupNames);
      lastScheduleKey.value = scheduleKey;

      if (groupSchedules.value.length === 0) {
        schedulesError.value = "Nenhum horario encontrado para as turmas selecionadas.";
      }
    } catch (error) {
      console.error(error);
      groupSchedules.value = [];
      schedulesError.value =
        "Nao foi possivel carregar os horarios do site do IFC. Se o navegador bloquear a leitura, sera preciso usar um proxy.";
    } finally {
      schedulesLoading.value = false;
    }
  }

  watch(
    [isOpenRef, tabRef, selectedGroupNames],
    async ([isOpen, currentTab]) => {
      if (!isOpen || currentTab !== "horarios") {
        return;
      }

      await loadGroupSchedules();
    },
    { immediate: true },
  );

  watch(selectedGroupNames, (groupNames) => {
    if (groupNames.length === 0) {
      resetSchedules();
    }
  });

  return {
    schedulesLoading,
    schedulesError,
    groupSchedules,
    loadGroupSchedules,
    resetSchedules,
  };
}
