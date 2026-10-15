import { InstrumentItem } from "@/components/ui/instrument-item";
import { InstrumentoAvaliacaoRepository } from "@/database/repositories/InstrumentoAvaliacaoRepository";
import { Instrument } from "@/types/instrument";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SelectInstrumentGuidePage() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadInstruments();
    }, []),
  );

  async function loadInstruments() {
    try {
      setLoading(true);
      const data = await InstrumentoAvaliacaoRepository.listarAtivos();
      setInstruments(data);
    } catch (error) {
      console.error("Erro ao carregar instrumentos:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectInstrument(instrument: Instrument) {
    router.push({
      pathname: "/(app)/informations/guide-test-meem",
      params: {
        instrumentId: String(instrument.id),
        instrumentNome: instrument.nome,
      },
    });
  }

  function handleBack() {
    router.back();
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.title}>Guias de Testes Cognitivos</Text>
          <Text style={styles.subtitle}>
            Selecione um instrumento para visualizar as instruções e o tutorial
            de aplicação
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando guias...</Text>
          </View>
        ) : instruments.length > 0 ? (
          <View style={styles.instrumentsList}>
            {instruments.map((instrument, index) => (
              <InstrumentItem
                key={instrument.id}
                instrument={instrument}
                index={index}
                onPress={handleSelectInstrument}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Nenhum guia disponível no momento.
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Text style={styles.outlineButtonText}>Voltar ao Início</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 12,
    paddingBottom: 28,
  },
  titleSection: {
    marginHorizontal: 16,
    marginVertical: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
    lineHeight: 20,
  },
  instrumentsList: {
    gap: 0,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: "center",
    marginHorizontal: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
  buttonContainer: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: "#A824EE",
    backgroundColor: "transparent",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonText: { color: "#A824EE", fontSize: 14, fontWeight: "500" },
});
