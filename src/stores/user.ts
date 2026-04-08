import type { QueryParams, User } from "@/types";
import { defineStore } from "pinia";
import { UsersService } from "@/services";
import userGroupsService from "@/services/user_groups";

export const useUserStore = defineStore("user", {
  state: () => ({
    users: [] as User[],
    selectedUser: null as User | null,
    loading: false,
    saving: false,
    current_page: 1,
    page_size: 10,
    count: 0,
    total_pages: 0,
  }),

  actions: {
    async loadUsers(params?: QueryParams) {
      this.loading = true;
      try {
        const response = await UsersService.getUsers(params);
        this.current_page = response.current_page || 1;
        this.page_size = response.page_size;
        this.count = response.count;
        this.total_pages = response.total_pages || 1;
        this.users = response.results;
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createUser(data: Partial<User>) {
      this.saving = true;
      try {
        const response = await UsersService.createUser(data);
        return response.data;
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        this.saving = false;
      }
    },

    async updateUser(id: number, data: Partial<User>) {
      this.saving = true;
      try {
        const response = await UsersService.updateUser(id, data);
        return response.data;
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        this.saving = false;
      }
    },

    async deleteUser(id: number) {
      this.saving = true;
      try {
        await UsersService.deleteUser(id);
        this.users = this.users.filter((u) => u.id !== id);
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        this.saving = false;
      }
    },

    async getUserById(id: number) {
      try {
        const response = await UsersService.getUserById(id);
        // Se a API retorna o usuário diretamente, não dentro de { data: ... }
        return response.data || response;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },

    async addUserToGroup(userId: number, groupId: number) {
      try {
        await userGroupsService.createUserGroup({
          user: userId,
          group: groupId,
        } as any);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },

    async removeUserFromGroup(userId: number, groupId: number) {
      try {
        const filteredResponse = await userGroupsService.getUserGroups({
          user: userId,
          group: groupId,
          page_size: 1000,
        });

        let relation = filteredResponse.results.find((item: any) => {
          const relationUserId = typeof item.user === "number" ? item.user : item.user?.id;
          const relationGroupId = typeof item.group === "number" ? item.group : item.group?.id;
          return relationUserId === userId && relationGroupId === groupId;
        });

        // Fallback defensivo: alguns ambientes podem ignorar filtros por query-string.
        if (!relation) {
          const allRelationsResponse = await userGroupsService.getUserGroups({ page_size: 1000 });
          relation = allRelationsResponse.results.find((item: any) => {
            const relationUserId = typeof item.user === "number" ? item.user : item.user?.id;
            const relationGroupId = typeof item.group === "number" ? item.group : item.group?.id;
            return relationUserId === userId && relationGroupId === groupId;
          });
        }

        if (!relation) {
          const alternateFilterResponse = await userGroupsService.getUserGroups({
            user_id: userId,
            group_id: groupId,
            page_size: 1000,
          } as any);

          relation = alternateFilterResponse.results.find((item: any) => {
            const relationUserId = typeof item.user === "number" ? item.user : item.user?.id;
            const relationGroupId = typeof item.group === "number" ? item.group : item.group?.id;
            return relationUserId === userId && relationGroupId === groupId;
          });
        }

        if (!relation) {
          console.warn("Relacao user_group nao encontrada para remocao", { userId, groupId });
          return;
        }

        await userGroupsService.deleteUserGroup(relation.id);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
});
