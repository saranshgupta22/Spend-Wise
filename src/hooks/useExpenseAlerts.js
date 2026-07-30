import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { Alert } from "react-native";
import { apiClient } from "@/src/api/client";
import { useAppStore } from "@/src/store/useAppStore";
import { useTransactions } from "@/src/hooks/useTransactions";
import { buildBudgetSnapshot } from "@/src/utils/budgetAlerts";
import {
  loadProfileBudgetSettings,
  mergeProfileBudgetSettings,
} from "@/src/utils/profileBudgetSettings";

export function useExpenseAlerts() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const transactions = useAppStore((state) => state.transactions);

  useTransactions();

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!isAuthenticated) return;

      const res = await apiClient.get("/auth/me");
      const localBudgetSettings = await loadProfileBudgetSettings();

      if (!isMounted || !res.success || !res.user) return;

      setUser(mergeProfileBudgetSettings(res.user, localBudgetSettings));
    };

    if (!user && isAuthenticated) {
      loadProfile();
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, setUser, user]);

  useEffect(() => {
    const runThresholdCheck = async () => {
      if (!isAuthenticated || !user) return;

      const snapshot = buildBudgetSnapshot({
        transactions,
        monthlyTargetExpense: user.monthly_target_expense,
        alertFrequency: user.alert_frequency,
      });

      const target = snapshot.periodTarget;
      if (target <= 0) return;

      const threshold =
        snapshot.percentUsed >= 90 ? 90 : snapshot.percentUsed >= 50 ? 50 : 0;
      if (!threshold) return;

      const targetKey = Math.round(target * 100) / 100;
      const storageKey = `expense-alert:${snapshot.frequency}:${snapshot.periodKey}:${targetKey}`;
      const savedThreshold = Number(await AsyncStorage.getItem(storageKey)) || 0;

      if (savedThreshold >= threshold) return;

      await AsyncStorage.setItem(storageKey, String(threshold));

      Alert.alert(
        threshold === 90
          ? `90% of ${snapshot.periodLabel} budget used`
          : `50% of ${snapshot.periodLabel} budget used`,
        `You have spent ₹${snapshot.spent.toLocaleString()} out of ₹${target.toLocaleString()} for this ${snapshot.periodLabel} period.`,
      );
    };

    runThresholdCheck();
  }, [isAuthenticated, transactions, user]);
}
