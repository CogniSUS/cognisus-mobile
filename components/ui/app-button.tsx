import { Pressable, Text } from "react-native";

type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
};

export function AppButton({
  title,
  onPress,
  variant = "primary",
}: AppButtonProps) {
  const base = "rounded-xl py-4 px-4";
  const styles =
    variant === "primary"
      ? "bg-primary"
      : "bg-surface border border-slate-200";

  const textStyles =
    variant === "primary"
      ? "text-white text-center font-semibold"
      : "text-text text-center font-semibold";

  return (
    <Pressable className={`${base} ${styles}`} onPress={onPress}>
      <Text className={textStyles}>{title}</Text>
    </Pressable>
  );
}