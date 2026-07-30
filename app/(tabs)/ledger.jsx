import { THEME } from "@/constants/theme";
import { apiClient } from "@/src/api/client";
import { useTransactions } from "@/src/hooks/useTransactions";
import { useAppStore } from "@/src/store/useAppStore";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { RectButton, Swipeable } from "react-native-gesture-handler";
import Animated, {
    Easing,
    FadeInDown,
    FadeInUp,
    FadeOutUp,
    Layout,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

export default function LedgerScreen() {
  useTransactions();

  const transactions = useAppStore((state) => state.transactions);
  const removeTransaction = useAppStore((state) => state.removeTransaction);
  const addTransaction = useAppStore((state) => state.addTransaction);

  const [isRecording, setIsRecording] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Manual Entry State
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");

  const pulse = useSharedValue(1);

  // Fetch transactions on mount
  useEffect(() => {
    apiClient
      .get("/transactions/get")
      .then((res) => {
        if (res.success && res.transactions) {
          useAppStore.setState({
            transactions: res.transactions.map((t) => ({
              id: t.id,
              title: t.merchant || "Manual Entry",
              merchant: t.merchant || "Manual Entry",
              amount: Number(t.amount),
              category: t.merchant_category || t.category || "Misc",
              type: t.type || "expense",
              is_cashback: Boolean(t.is_cashback || t.isCashback),
              is_recurring: Boolean(t.is_recurring || t.isRecurring),
              raw_sms: t.raw_sms || "",
              date: new Date(t.date).toISOString(),
            })),
          });
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (isRecording) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.05, {
            duration: 600,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );

      setTimeout(() => {
        setIsRecording(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        triggerToast();
      }, 1500);
    } else {
      pulse.value = withTiming(1, { duration: 300 });
    }
  }, [isRecording]);

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const animatedMicStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }],
      shadowOpacity: isRecording ? 0.3 : 0.1,
    };
  });

  const handleAddManual = async () => {
    if (!amount) return;
    try {
      const normalizedAmount = Number(amount);
      const res = await apiClient.post("/transactions/add", {
        amount: normalizedAmount,
        merchant: merchant || "Cash Entry",
        type: "expense",
      });
      if (res.success) {
        setShowModal(false);
        setAmount("");
        setMerchant("");
        addTransaction({
          id: res.transaction.id,
          title: res.transaction.merchant || "Cash Entry",
          merchant: res.transaction.merchant || "Cash Entry",
          amount: normalizedAmount,
          category: res.transaction.merchant_category || "Misc",
          type: "expense",
          is_cashback: Boolean(
            res.transaction.is_cashback || res.transaction.isCashback,
          ),
          is_recurring: Boolean(
            res.transaction.is_recurring || res.transaction.isRecurring,
          ),
          raw_sms: res.transaction.raw_sms || "",
          date: new Date().toISOString(),
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        triggerToast();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteTransaction = async (tx) => {
    try {
      const res = await apiClient.delete(`/transactions/${tx.id}`);
      if (res.success) {
        removeTransaction(tx);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const displayData = [...transactions];

  const renderRightActions = (tx) => (
    <RectButton
      style={styles.deleteAction}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        handleDeleteTransaction(tx);
      }}
    >
      <Text style={styles.actionText}>Delete</Text>
    </RectButton>
  );

  const getCategoryConfig = (category) => {
    switch (category) {
      case "Income":
        return {
          icon: "arrow-down-outline",
          color: THEME.colors.success,
          isIncome: true,
        };
      case "Tech":
        return {
          icon: "hardware-chip-outline",
          color: THEME.colors.secondary,
          isIncome: false,
        };
      case "Transport":
        return {
          icon: "car-sport-outline",
          color: THEME.colors.primary,
          isIncome: false,
        };
      case "Shopping":
        return {
          icon: "cart-outline",
          color: THEME.colors.danger,
          isIncome: false,
        };
      default:
        return {
          icon: "wallet-outline",
          color: THEME.colors.textSecondary,
          isIncome: false,
        };
    }
  };

  const renderItem = ({ item, index }) => {
    const { icon, color, isIncome } = getCategoryConfig(item.category);

    return (
      <Animated.View
        layout={Layout.springify()}
        entering={FadeInDown.delay(index * 75).springify()}
      >
        <Swipeable renderRightActions={() => renderRightActions(item)}>
          <View style={styles.itemContainer}>
            <BlurView
              intensity={THEME.glass?.intensity || 30}
              tint="dark"
              style={StyleSheet.absoluteFillObject}
            />
            <View
              style={[
                styles.itemLayout,
                {
                  borderLeftColor: isIncome
                    ? THEME.colors.success
                    : THEME.colors.danger,
                  borderLeftWidth: 3,
                },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: "transparent",
                    borderColor: THEME.colors.borderGlass,
                    borderWidth: 1,
                  },
                ]}
              >
                <Ionicons name={icon} size={20} color={color} />
              </View>

              <View style={styles.contentContainer}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDate}>
                  {item.category} • {item.date}
                </Text>
              </View>

              <Text
                style={[
                  styles.itemAmount,
                  {
                    color: isIncome
                      ? THEME.colors.success
                      : THEME.colors.textPrimary,
                  },
                ]}
              >
                {isIncome ? "+" : "-"}₹{item.amount.toLocaleString()}
              </Text>
            </View>
          </View>
        </Swipeable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {showToast && (
        <Animated.View
          entering={FadeInUp.springify()}
          exiting={FadeOutUp.duration(300)}
          style={styles.toastContainer}
        >
          <View style={styles.toast}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={THEME.colors.success}
            />
            <Text style={styles.toastText}>
              Transaction successfully logged.
            </Text>
          </View>
        </Animated.View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>SPENDWISE LEDGER</Text>
      </View>
      <View style={styles.listContainer}>
        {displayData.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="receipt-outline"
              size={64}
              color={THEME.colors.textSecondary}
            />
            <Text style={styles.emptyText}>No Transactions Detected</Text>
          </View>
        ) : (
          <FlashList
            data={displayData}
            renderItem={renderItem}
            estimatedItemSize={75}
            showsVerticalScrollIndicator={false}
            onScroll={() => Haptics.selectionAsync()}
          />
        )}
      </View>

      <View style={styles.fabContainer}>
        <Animated.View
          style={[styles.fabGlow, animatedMicStyle, { marginRight: 15 }]}
        >
          <RectButton
            style={[styles.fab, isRecording && styles.fabRecording]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              if (!isRecording) setIsRecording(true);
            }}
          >
            <Ionicons
              name="mic-outline"
              size={24}
              color={
                isRecording ? THEME.colors.background : THEME.colors.secondary
              }
            />
          </RectButton>
        </Animated.View>
        <Animated.View style={styles.fabGlow}>
          <RectButton
            style={styles.fab}
            onPress={() => {
              Haptics.selectionAsync();
              setShowModal(true);
            }}
          >
            <Ionicons name="add" size={24} color={THEME.colors.primary} />
          </RectButton>
        </Animated.View>
      </View>

      <Modal visible={showModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <BlurView intensity={80} tint="dark" style={styles.modalContent}>
            <Text style={styles.modalTitle}>Manual Expense</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Amount (₹)"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="number-pad"
              value={amount}
              onChangeText={setAmount}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Merchant or Purpose"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={merchant}
              onChangeText={setMerchant}
            />

            <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: THEME.colors.surfaceGlass },
                ]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: THEME.colors.primary },
                ]}
                onPress={handleAddManual}
              >
                <Text style={[styles.modalBtnText, { color: "#000" }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  toastContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    zIndex: 100,
    alignItems: "center",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.15)", // Success tint
    borderColor: "rgba(16, 185, 129, 0.4)",
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    shadowColor: THEME.colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  toastText: {
    ...THEME.typography.boldHeader,
    color: "#FFF",
    fontSize: 14,
  },
  header: {
    paddingHorizontal: THEME.layout.spacing,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontFamily: 'Sora_800ExtraBold',
    letterSpacing: 2,
    textTransform: "uppercase",
    fontSize: 22,
    color: THEME.colors.textPrimary,
  },
  listContainer: {
    flex: 1,
  },
  itemContainer: {
    height: 75,
    marginBottom: 12,
    marginHorizontal: THEME.layout.spacing,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.layout.borderRadius,
    borderWidth: 1,
    borderColor: THEME.colors.borderGlass,
    overflow: "hidden",
  },
  itemLayout: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: "100%",
    zIndex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  itemTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: THEME.colors.textPrimary,
    marginBottom: 2,
  },
  itemDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: THEME.colors.textSecondary,
    letterSpacing: 0.2,
  },
  itemAmount: {
    fontFamily: 'Sora_700Bold',
    fontSize: 16,
  },
  deleteAction: {
    backgroundColor: THEME.colors.danger,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: 75,
    borderRadius: THEME.layout.borderRadius,
    marginRight: THEME.layout.spacing,
    marginBottom: 12,
  },
  actionText: {
    ...THEME.typography.boldHeader,
    color: "#FFF",
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.5,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    marginTop: 16,
    color: THEME.colors.textSecondary,
    fontSize: 15,
  },
  fabContainer: {
    position: "absolute",
    bottom: 100,
    right: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  fabGlow: {
    shadowColor: THEME.colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 15,
    elevation: 8,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.borderGlass,
    justifyContent: "center",
    alignItems: "center",
  },
  fabRecording: {
    backgroundColor: THEME.colors.secondary,
    borderColor: THEME.colors.secondary,
    shadowColor: "transparent",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 300,
    borderTopWidth: 1,
    borderColor: THEME.colors.borderGlass,
  },
  modalTitle: {
    fontFamily: 'Sora_700Bold',
    fontSize: 20,
    color: "#FFF",
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    color: "#FFF",
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  modalBtnText: {
    ...THEME.typography.boldHeader,
    fontSize: 16,
    color: "#FFF",
  },
});
