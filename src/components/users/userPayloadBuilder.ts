import type { User as BaseUser } from "@/types";
import type { UserFieldFlags, UserFormState } from "@/composables/useUserFormState";
import { formatInputDateTimeToApi } from "@/utils/dateTime";

export interface SavePayloadUser extends Omit<BaseUser, "user_groups"> {
  user_groups?: (number | { id: number; name: string })[];
}

export function buildUserPayload(
  savedUser: SavePayloadUser,
  form: UserFormState,
  fieldFlags: UserFieldFlags,
  canShowPasswordField: boolean,
  pictureRemoved: boolean,
): SavePayloadUser {
  const payload: SavePayloadUser = {
    ...savedUser,
    name: form.name,
    cpf: form.cpf,
    phone: form.phone,
    registration: form.registration,
    user_groups: form.userGroups,
    device_scope: form.panelAccessOnly ? "none" : form.deviceScope,
    selected_device_ids: form.panelAccessOnly ? [] : form.selectedDeviceIds,
    picture_id: savedUser.picture_id,
    remove_picture: pictureRemoved,
    start_date: formatInputDateTimeToApi(form.startDate),
    end_date: formatInputDateTimeToApi(form.endDate),
  };

  if (canShowPasswordField && form.password.trim()) {
    payload.password = form.password;
  }

  if (fieldFlags.hasEmailField) {
    payload.email = form.email;
  }
  if (fieldFlags.hasAppRoleField) {
    payload.app_role = form.appRole;
  }
  if (fieldFlags.hasPanelAccessOnlyField) {
    payload.panel_access_only = form.panelAccessOnly;
  }
  if (fieldFlags.hasUserTypeField) {
    payload.user_type_id = form.isVisitor ? 1 : (null as unknown as number);
  }
  if (fieldFlags.hasDeviceAdminField) {
    payload.device_admin = form.deviceAdmin;
  }

  return payload;
}
