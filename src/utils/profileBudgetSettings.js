import AsyncStorage from "@react-native-async-storage/async-storage";

const PROFILE_BUDGET_SETTINGS_KEY = "spendwise.profileBudgetSettings";

export const loadProfileBudgetSettings = async () => {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_BUDGET_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.log("[Profile Budget Load Error]", error);
    return null;
  }
};

export const saveProfileBudgetSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(
      PROFILE_BUDGET_SETTINGS_KEY,
      JSON.stringify(settings),
    );
  } catch (error) {
    console.log("[Profile Budget Save Error]", error);
  }
};

export const mergeProfileBudgetSettings = (user, settings) => {
  if (!user) return user;
  if (!settings) return user;

  return {
    ...user,
    monthly_target_expense:
      settings.monthly_target_expense ?? user.monthly_target_expense,
    alert_frequency: settings.alert_frequency ?? user.alert_frequency,
  };
};
