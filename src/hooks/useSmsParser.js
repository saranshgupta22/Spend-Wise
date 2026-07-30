import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef } from "react";
import { AppState, NativeModules, PermissionsAndroid, Platform } from "react-native";
import { apiClient } from "@/src/api/client";
import { useAppStore } from "../store/useAppStore";
import { parseSmsTransaction } from "../utils/transactionClassifier";

const LAST_SYNC_KEY = "sms:lastSyncAt";
const PROCESSED_KEY = "sms:processedFingerprints";
const SYNC_WINDOW_MS = 1000 * 60 * 60 * 24 * 7;
const POLL_INTERVAL_MS = 20000;
const SMS_MODULE =
  NativeModules.SmsAndroid ||
  NativeModules.GetSmsAndroid ||
  NativeModules.RNGetSmsAndroid ||
  null;

function parseSmsDate(message) {
  const raw = Number(message?.date ?? message?.timestamp ?? message?.received_at);
  if (!raw || Number.isNaN(raw)) return Date.now();
  return raw > 10_000_000_000 ? raw : raw * 1000;
}

function normalizeMessage(rawMessage) {
  if (!rawMessage) return null;

  const body = String(rawMessage.body || rawMessage.message || "").trim();
  if (!body) return null;

  return {
    id:
      rawMessage._id ||
      rawMessage.id ||
      rawMessage.messageId ||
      `${rawMessage.address || "sms"}-${parseSmsDate(rawMessage)}`,
    address: rawMessage.address || rawMessage.sender || "",
    body,
    date: parseSmsDate(rawMessage),
  };
}

function getMessageFingerprint(message) {
  return `${message.address}|${message.date}|${message.body}`;
}

function listInboxMessages(minDate) {
  return new Promise((resolve, reject) => {
    if (!SMS_MODULE) {
      resolve([]);
      return;
    }

    if (typeof SMS_MODULE.list !== "function") {
      resolve([]);
      return;
    }

    const filter = JSON.stringify({
      box: "inbox",
      minDate,
      maxCount: 50,
    });

    SMS_MODULE.list(
      filter,
      (error) => reject(new Error(error || "Failed to read SMS inbox")),
      (count, smsList) => {
        try {
          const messages = JSON.parse(smsList || "[]");
          resolve(Array.isArray(messages) ? messages : []);
        } catch (error) {
          reject(error);
        }
      },
    );
  });
}

export const useSmsParser = () => {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const addTransaction = useAppStore((state) => state.addTransaction);
  const showAutoTransactionPopup = useAppStore(
    (state) => state.showAutoTransactionPopup,
  );
  const setSmsSyncStatus = useAppStore((state) => state.setSmsSyncStatus);
  const processedFingerprintsRef = useRef(new Set());
  const lastSyncRef = useRef(Date.now() - SYNC_WINDOW_MS);

  useEffect(() => {
    if (Platform.OS !== "android" || !isAuthenticated) {
      return undefined;
    }

    let isMounted = true;
    let intervalId;
    let appStateSubscription;

    const bootSync = async () => {
      const granted = await requestSmsPermission();
      if (!granted || !isMounted) return;

      await loadSyncState();
      await syncSmsInbox();

      intervalId = setInterval(syncSmsInbox, POLL_INTERVAL_MS);
      appStateSubscription = AppState.addEventListener("change", (state) => {
        if (state === "active") {
          syncSmsInbox();
        }
      });
    };

    const requestSmsPermission = async () => {
      try {
        setSmsSyncStatus("requesting_permission");
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          {
            title: "SpendWise SMS Permission",
            message:
              "SpendWise reads bank and UPI transaction SMS to auto-add expenses.",
            buttonNeutral: "Later",
            buttonNegative: "Cancel",
            buttonPositive: "Allow",
          },
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setSmsSyncStatus("permission_denied");
          return false;
        }

        if (!SMS_MODULE) {
          setSmsSyncStatus("native_module_missing");
          return false;
        }

        setSmsSyncStatus("ready");
        return true;
      } catch (error) {
        console.warn("[SMS Sync] permission error", error);
        setSmsSyncStatus("error");
        return false;
      }
    };

    const loadSyncState = async () => {
      try {
        const [lastSyncValue, processedValue] = await Promise.all([
          AsyncStorage.getItem(LAST_SYNC_KEY),
          AsyncStorage.getItem(PROCESSED_KEY),
        ]);

        if (lastSyncValue) {
          lastSyncRef.current = Number(lastSyncValue) || lastSyncRef.current;
        }

        if (processedValue) {
          const storedFingerprints = JSON.parse(processedValue);
          processedFingerprintsRef.current = new Set(storedFingerprints);
        }
      } catch (error) {
        console.warn("[SMS Sync] failed to restore state", error);
      }
    };

    const persistSyncState = async () => {
      try {
        const fingerprints = Array.from(processedFingerprintsRef.current).slice(-200);
        await AsyncStorage.multiSet([
          [LAST_SYNC_KEY, String(lastSyncRef.current)],
          [PROCESSED_KEY, JSON.stringify(fingerprints)],
        ]);
      } catch (error) {
        console.warn("[SMS Sync] failed to persist state", error);
      }
    };

    const syncSmsInbox = async () => {
      try {
        setSmsSyncStatus("syncing");

        const rawMessages = await listInboxMessages(lastSyncRef.current);
        const messages = rawMessages
          .map(normalizeMessage)
          .filter(Boolean)
          .sort((a, b) => a.date - b.date);

        let latestSeenDate = lastSyncRef.current;

        for (const message of messages) {
          latestSeenDate = Math.max(latestSeenDate, message.date);

          const fingerprint = getMessageFingerprint(message);
          if (processedFingerprintsRef.current.has(fingerprint)) {
            continue;
          }

          const parsedTransaction = parseSmsTransaction(
            message.body,
            message.address,
          );

          processedFingerprintsRef.current.add(fingerprint);

          if (!parsedTransaction) {
            continue;
          }

          const response = await apiClient.post("/transactions/add", parsedTransaction);
          if (!response.success || !response.transaction) {
            continue;
          }

          const transaction = {
            id: response.transaction.id,
            title: response.transaction.merchant || parsedTransaction.merchant,
            amount: Number(response.transaction.amount || parsedTransaction.amount),
            category:
              response.transaction.merchant_category ||
              parsedTransaction.merchant_category,
            type: response.transaction.type || parsedTransaction.type,
            is_cashback: Boolean(response.transaction.is_cashback),
            is_recurring: Boolean(response.transaction.is_recurring),
            date: new Date(
              response.transaction.date || message.date || Date.now(),
            ).toISOString(),
          };

          addTransaction(transaction);
          showAutoTransactionPopup(transaction);
        }

        lastSyncRef.current = latestSeenDate;
        await persistSyncState();
        setSmsSyncStatus("ready");
      } catch (error) {
        console.warn("[SMS Sync] failed", error);
        setSmsSyncStatus("error");
      }
    };

    bootSync();

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
      appStateSubscription?.remove?.();
    };
  }, [
    addTransaction,
    isAuthenticated,
    setSmsSyncStatus,
    showAutoTransactionPopup,
  ]);
};
