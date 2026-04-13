import type { User as BaseUser } from "@/types";
import { reactive, watch, type Ref } from "vue";
import { formatApiDateTimeToInput } from "@/utils/dateTime";

export interface UserDialogUser extends Omit<BaseUser, "user_groups"> {
  user_groups?: (number | { id: number; name: string })[];
}

export interface UserFormState {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  password: string;
  appRole: BaseUser["app_role"];
  panelAccessOnly: boolean;
  registration: string;
  pin: string;
  deviceScope: BaseUser["device_scope"];
  selectedDeviceIds: number[];
  isVisitor: boolean;
  deviceAdmin: boolean;
  userGroups: number[];
  startDate: string | null;
  endDate: string | null;
  lastPassageAt: string | null;
}

export interface UserFieldFlags {
  hasEmailField: boolean;
  hasAppRoleField: boolean;
  hasPanelAccessOnlyField: boolean;
  hasUserTypeField: boolean;
  hasDeviceAdminField: boolean;
}

function hasOwn(obj: unknown, key: string): boolean {
  return !!obj && Object.prototype.hasOwnProperty.call(obj, key);
}

export function useUserFormState(userRef: Ref<UserDialogUser | null>) {
  const form = reactive<UserFormState>({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    password: "",
    appRole: "",
    panelAccessOnly: false,
    registration: "",
    pin: "",
    deviceScope: "all_active",
    selectedDeviceIds: [],
    isVisitor: false,
    deviceAdmin: false,
    userGroups: [],
    startDate: null,
    endDate: null,
    lastPassageAt: null,
  });

  const fieldFlags = reactive<UserFieldFlags>({
    hasEmailField: false,
    hasAppRoleField: false,
    hasPanelAccessOnlyField: false,
    hasUserTypeField: false,
    hasDeviceAdminField: false,
  });

  function initializeFromUser(newUser: UserDialogUser | null) {
    if (!newUser) {
      return;
    }

    fieldFlags.hasEmailField = hasOwn(newUser, "email");
    fieldFlags.hasAppRoleField = hasOwn(newUser, "app_role");
    fieldFlags.hasPanelAccessOnlyField = hasOwn(newUser, "panel_access_only");
    fieldFlags.hasUserTypeField = hasOwn(newUser, "user_type_id");
    fieldFlags.hasDeviceAdminField = hasOwn(newUser, "device_admin");

    form.name = newUser.name;
    form.email = fieldFlags.hasEmailField ? (newUser.email ?? "") : "";
    form.cpf = newUser.cpf ?? "";
    form.phone = newUser.phone ?? "";
    form.password = "";
    form.appRole = fieldFlags.hasAppRoleField ? (newUser.app_role ?? "") : "";
    form.panelAccessOnly = fieldFlags.hasPanelAccessOnlyField ? !!newUser.panel_access_only : false;
    form.registration = newUser.registration ?? "";
    form.pin = newUser.pin ?? "";
    form.deviceScope = newUser.device_scope ?? "all_active";
    form.selectedDeviceIds =
      newUser.selected_device_ids ?? newUser.selected_devices?.map((device) => device.id) ?? [];
    form.isVisitor = fieldFlags.hasUserTypeField ? newUser.user_type_id === 1 : false;
    form.deviceAdmin = fieldFlags.hasDeviceAdminField ? !!newUser.device_admin : false;
    form.userGroups =
      newUser.user_groups?.map((group) => (typeof group === "number" ? group : group.id)) || [];
    form.startDate = newUser.start_date
      ? formatApiDateTimeToInput(newUser.start_date)
      : newUser.id === 0
        ? form.startDate
        : null;
    form.endDate = newUser.end_date
      ? formatApiDateTimeToInput(newUser.end_date)
      : null;
    form.lastPassageAt = newUser.last_passage_at ?? null;
  }

  function setMinimalDefaults() {
    form.isVisitor = true;
    form.panelAccessOnly = false;
    form.deviceAdmin = false;
    form.appRole = "";
  }

  watch(
    userRef,
    (newUser) => {
      initializeFromUser(newUser);
    },
    { immediate: true },
  );

  return {
    form,
    fieldFlags,
    setMinimalDefaults,
  };
}
