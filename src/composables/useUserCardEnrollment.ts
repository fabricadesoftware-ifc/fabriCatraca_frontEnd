import { CardsService } from "@/services";
import CardEnrollService from "@/services/card_enroll";
import { toast } from "vue3-toastify";
import { ref, watch, type ComputedRef, type Ref } from "vue";

interface UserLike {
  id?: number;
}

export function useUserCardEnrollment(
  userRef: Ref<UserLike | null>,
  isOpenRef: Ref<boolean>,
  isMinimalModeRef: ComputedRef<boolean>,
) {
  const cardEnrollDevice = ref<number | null>(null);
  const capturedCardValue = ref<number | null>(null);
  const enrollingCard = ref(false);
  const existingCards = ref<Array<{ id: number; value: number }>>([]);
  const deletingCardId = ref<number | null>(null);

  function resetEnrollmentState() {
    cardEnrollDevice.value = null;
    capturedCardValue.value = null;
    enrollingCard.value = false;
    deletingCardId.value = null;
  }

  async function loadExistingCards() {
    if (!userRef.value?.id) {
      existingCards.value = [];
      return;
    }

    try {
      const response = await CardsService.getCards({ user_id: userRef.value.id });
      existingCards.value = response.results.map((card) => ({ id: card.id, value: card.value }));
    } catch {
      existingCards.value = [];
    }
  }

  async function deleteExistingCard(id: number) {
    deletingCardId.value = id;
    try {
      await CardsService.deleteCard(id);
      toast.success("Cartao removido");
      await loadExistingCards();
    } catch {
      toast.error("Erro ao remover cartao");
    } finally {
      deletingCardId.value = null;
    }
  }

  async function startCardEnroll() {
    if (!cardEnrollDevice.value) {
      toast.warning("Selecione uma catraca para capturar o cartao");
      return;
    }

    enrollingCard.value = true;
    try {
      const result = await CardEnrollService.enrollCard(cardEnrollDevice.value);
      capturedCardValue.value = result.card_value;
      toast.success(`Cartao capturado com sucesso! (${result.card_value})`);
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Erro ao capturar cartao";
      toast.error(msg);
    } finally {
      enrollingCard.value = false;
    }
  }

  watch(
    [isOpenRef, isMinimalModeRef, userRef],
    async ([isOpen, isMinimalMode]) => {
      if (!isOpen || !isMinimalMode) {
        return;
      }

      resetEnrollmentState();
      await loadExistingCards();
    },
    { immediate: true },
  );

  watch(userRef, () => {
    resetEnrollmentState();
    existingCards.value = [];
  });

  return {
    cardEnrollDevice,
    capturedCardValue,
    enrollingCard,
    existingCards,
    deletingCardId,
    loadExistingCards,
    deleteExistingCard,
    startCardEnroll,
    resetEnrollmentState,
  };
}
