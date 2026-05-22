/**
 * Item de instrumento na lista de seleção
 * - Ícone colorido à esquerda (56x56px)
 * - Nome do instrumento (ex: "MoCA")
 * - Abreviação/descrição (ex: "Montreal Cognitive Assessment")
 * - Duração com ícone (ex: "⏱ 10-15 min")
 * - Descrição complementar (ex: "Avaliação cognitiva geral")
 * - Seta à direita (chevron-forward)
 *
 * Props:
 * - instrument: Instrument - Dados do instrumento
 * - onPress: (instrument) => void - Callback ao clicar
 * - index: number - Para usar cor cíclica
 */

import { Instrument } from "@/types/instrument";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
interface InstrumentItemProps {
  instrument: Instrument;
  onPress: (instrument: Instrument) => void;
  index: number;
}
export function InstrumentItem({
  instrument,
  onPress,
  index,
}: InstrumentItemProps) {
  const INSTRUMENT_COLORS = [
    "#A855F7", // Roxo
    "#3B82F6", // Azul
    "#22C55E", // Verde
    "#F97316", // Laranja
  ];

  const INSTRUMENT_ICONS: Record<string, string> = {
    moca: "brain",
    "Mini Exame do Estado Mental": "document",
    "fluência verbal": "chatbubble",
    "desenho do relógio": "time",
  };
  const color = INSTRUMENT_COLORS[index % INSTRUMENT_COLORS.length];
  const iconName = (INSTRUMENT_ICONS[instrument.nome] || "square") as any;

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={() => onPress(instrument)}
    >
      {/* Ícone colorido à esquerda */}
      <View style={[styles.icon, { backgroundColor: color }]}>
        <Ionicons name={iconName} size={28} color="#FFFFFF" />
      </View>

      {/* Conteúdo do instrumento */}
      <View style={styles.content}>
        {/* Nome do instrumento */}
        <Text style={styles.name}>{instrument.nome}</Text>

        {/* Abreviação/descrição */}
        {instrument.abreviacao && (
          <Text style={styles.abbreviation}>{instrument.abreviacao}</Text>
        )}

        {/* Duração e descrição complementar */}
        <View style={styles.footer}>
          <View style={styles.duration}>
            <Ionicons name="time-outline" size={12} color="#64748B" />
            <Text style={styles.durationText}>
              {instrument.tempo_estimado_min || "5"}-
              {(instrument.tempo_estimado_min || 5) + 5} min
            </Text>
          </View>
        </View>
      </View>

      {/* Seta à direita */}
      <Ionicons
        name="chevron-forward"
        size={20}
        color="#A855F7"
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },
  abbreviation: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 6,
  },
  footer: {
    gap: 4,
  },
  duration: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  complementary: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  chevron: {
    marginLeft: 8,
  },
});
