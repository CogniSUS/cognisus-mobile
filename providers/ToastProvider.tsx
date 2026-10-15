import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

type ToastType = "success" | "error" | "info";

type ToastState = {
  visible: boolean;
  message: string;
  type: ToastType;
};

type ShowToastParams = {
  message: string;
  type?: ToastType;
  duration?: number;
};

type ToastContextType = {
  showToast: ({ message, type, duration }: ShowToastParams) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  hideToast: () => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: "",
    type: "info",
  });

  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast((prev) => ({ ...prev, visible: false, message: "" }));
    });
  }, [opacity, translateY]);

  const showToast = useCallback(
    ({
      message,
      type = "info",
      duration = 2800,
    }: ShowToastParams) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setToast({
        visible: true,
        message,
        type,
      });

      translateY.setValue(-120);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [hideToast, opacity, translateY]
  );

  const value = useMemo(
    () => ({
      showToast,
      success: (message: string, duration?: number) =>
        showToast({ message, type: "success", duration }),
      error: (message: string, duration?: number) =>
        showToast({ message, type: "error", duration }),
      info: (message: string, duration?: number) =>
        showToast({ message, type: "info", duration }),
      hideToast,
    }),
    [hideToast, showToast]
  );

  const toastStyle =
    toast.type === "success"
      ? styles.success
      : toast.type === "error"
      ? styles.error
      : styles.info;

  const iconName =
    toast.type === "success"
      ? "checkmark-circle"
      : toast.type === "error"
      ? "close-circle"
      : "information-circle";

  return (
    <ToastContext.Provider value={value}>
      {children}

      {toast.visible && (
        <SafeAreaView
          pointerEvents="box-none"
          style={styles.overlay}
          edges={["top"]}
        >
          <Animated.View
            style={[
              styles.toastContainer,
              toastStyle,
              {
                opacity,
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={styles.toastContent}>
              <Ionicons name={iconName} size={20} color="#FFFFFF" />
              <Text style={styles.toastText}>{toast.message}</Text>
            </View>

            <Pressable onPress={hideToast} hitSlop={8}>
              <Ionicons name="close" size={18} color="#FFFFFF" />
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      )}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToastContext must be used within ToastProvider");
  }

  return context;
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 16,
  },
  toastContainer: {
    marginTop: 8,
    minHeight: 56,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  toastContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingRight: 10,
  },
  toastText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  success: {
    backgroundColor: "#22A06B",
  },
  error: {
    backgroundColor: "#D14343",
  },
  info: {
    backgroundColor: "#6E34B5",
  },
});