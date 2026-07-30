import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
} from "react-native-reanimated";
import { THEME } from "@/constants/theme";
import { useAppStore } from "@/src/store/useAppStore";

export function AutoTransactionPopup() {
  const transaction = useAppStore((state) => state.latestAutoTransaction);
  const clearAutoTransactionPopup = useAppStore(
    (state) => state.clearAutoTransactionPopup,
  );

  useEffect(() => {
    if (!transaction) return undefined;

    const timeoutId = setTimeout(() => {
      clearAutoTransactionPopup();
    }, 4500);

    return () => clearTimeout(timeoutId);
  }, [clearAutoTransactionPopup, transaction]);

  if (!transaction) {
    return null;
  }

  return (
    <Modal transparent animationType="fade" visible onRequestClose={clearAutoTransactionPopup}>
      <View style={styles.overlay} pointerEvents="box-none">
        <Animated.View
          entering={FadeInDown.springify()}
          exiting={FadeOutUp.duration(200)}
          style={styles.card}
        >
          <View style={styles.headerRow}>
            <View style={styles.iconWrap}>
              <Ionicons name="notifications-outline" size={18} color={THEME.colors.secondary} />
            </View>
            <Text style={styles.headerText}>Transaction detected</Text>
            <Pressable onPress={clearAutoTransactionPopup} hitSlop={10}>
              <Ionicons name="close" size={18} color={THEME.colors.textSecondary} />
            </Pressable>
          </View>

          <Text style={styles.merchantText}>{transaction.title}</Text>
          <Text style={styles.metaText}>
            {transaction.category} • {transaction.type === "income" ? "Income" : "Expense"}
          </Text>
          <Text style={styles.amountText}>
            {transaction.type === "income" ? "+" : "-"}₹
            {Number(transaction.amount || 0).toLocaleString()}
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 64,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#081120",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56, 189, 248, 0.14)",
  },
  headerText: {
    flex: 1,
    color: THEME.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  merchantText: {
    color: THEME.colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },
  metaText: {
    color: THEME.colors.textSecondary,
    marginTop: 6,
  },
  amountText: {
    color: THEME.colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 10,
  },
});
