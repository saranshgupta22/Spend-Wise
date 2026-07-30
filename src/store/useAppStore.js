import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export const useAppStore = create((set, get) => ({
  isAuthenticated: false,
  userToken: null,
  userPhone: null,
  refreshToken: null,
  user: null,
  latestAutoTransaction: null,
  smsSyncStatus: "idle",

  // Initialize from storage
  initialize: async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const phone = await AsyncStorage.getItem("userPhone");
      const refresh = await AsyncStorage.getItem("refreshToken");

      if (token && phone) {
        set({
          isAuthenticated: true,
          userToken: token,
          userPhone: phone,
          refreshToken: refresh,
        });
      }
    } catch (error) {
      console.log("Failed to initialize auth:", error);
    }
  },

  login: (phone, token, refreshToken = null) => {
    // Store tokens
    AsyncStorage.setItem("accessToken", token);
    AsyncStorage.setItem("userPhone", phone);
    if (refreshToken) {
      AsyncStorage.setItem("refreshToken", refreshToken);
    }

    set({
      isAuthenticated: true,
      userPhone: phone,
      userToken: token,
      refreshToken: refreshToken,
    });
  },

  logout: async () => {
    try {
      await AsyncStorage.multiRemove([
        "accessToken",
        "refreshToken",
        "userPhone",
      ]);
    } catch (error) {
      console.log("Failed to clear storage:", error);
    }

    set({
      isAuthenticated: false,
      userToken: null,
      userPhone: null,
      refreshToken: null,
      user: null,
    });
  },

  updateToken: (token, refreshToken = null) => {
    AsyncStorage.setItem("accessToken", token);
    if (refreshToken) {
      AsyncStorage.setItem("refreshToken", refreshToken);
    }
    set({ userToken: token, refreshToken: refreshToken || get().refreshToken });
  },

  setUser: (user) => set({ user }),
  setSmsSyncStatus: (smsSyncStatus) => set({ smsSyncStatus }),
  showAutoTransactionPopup: (transaction) =>
    set({ latestAutoTransaction: transaction }),
  clearAutoTransactionPopup: () => set({ latestAutoTransaction: null }),

  balance: 145000,
  budgetCap: 150000,
  transactions: [],

  setTransactions: (transactions) => set({ transactions }),

  addTransaction: (tx) => {
    const amount = Number(tx.amount) || 0;

    set((state) => ({
      transactions: [{ ...tx, amount }, ...state.transactions],
      balance:
        state.balance +
        (tx.type === "expense" ? -amount : tx.type === "income" ? amount : 0),
    }));
  },

  removeTransaction: (tx) => {
    const amount = Number(tx.amount) || 0;

    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== tx.id),
      balance:
        state.balance +
        (tx.type === "expense" ? amount : tx.type === "income" ? -amount : 0),
    }));
  },
}));
