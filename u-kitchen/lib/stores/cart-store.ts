import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface CartState {
  items: Record<string, number>
  setQuantity: (dishId: string, quantity: number) => void
  add: (dishId: string, delta: number) => void
  remove: (dishId: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: {},

      setQuantity: (dishId, quantity) =>
        set((state) => {
          const current = state.items ?? {}
          const next = { ...current }
          if (quantity <= 0) {
            delete next[dishId]
          } else {
            next[dishId] = quantity
          }
          return { items: next }
        }),

      add: (dishId, delta) =>
        set((state) => {
          const current = state.items ?? {}
          const nextQty = (current[dishId] ?? 0) + delta
          const next = { ...current }
          if (nextQty <= 0) {
            delete next[dishId]
          } else {
            next[dishId] = nextQty
          }
          return { items: next }
        }),

      remove: (dishId) =>
        set((state) => {
          const current = state.items ?? {}
          if (!(dishId in current)) return state
          const next = { ...current }
          delete next[dishId]
          return { items: next }
        }),

      clear: () => set({ items: {} }),
    }),
    {
      name: "u-kitchen-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      merge: (persisted, current) => {
        const incoming = (persisted as Partial<CartState> | undefined)?.items
        return {
          ...current,
          items: incoming ?? {},
        }
      },
    },
  ),
)
