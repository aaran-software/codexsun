import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { WishlistItem } from "@/types/storefront"

type WishlistStoreState = {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (productId: number) => void
  toggleItem: (item: WishlistItem) => void
  clearWishlist: () => void
  isInWishlist: (productId: number) => boolean
}

export const useWishlistStore = create<WishlistStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => state.items.some((existing) => existing.productId === item.productId)
        ? state
        : { items: [item, ...state.items] }),
      removeItem: (productId) => set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
      toggleItem: (item) => set((state) => state.items.some((existing) => existing.productId === item.productId)
        ? { items: state.items.filter((existing) => existing.productId !== item.productId) }
        : { items: [item, ...state.items] }),
      clearWishlist: () => set({ items: [] }),
      isInWishlist: (productId) => get().items.some((item) => item.productId === productId),
    }),
    {
      name: "cxstore.wishlist",
    },
  ),
)
