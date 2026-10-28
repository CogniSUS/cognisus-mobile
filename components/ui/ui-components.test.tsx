import { fireEvent, render } from "@testing-library/react-native";
import { AppButton } from "./app-button";
import { InstrumentItem } from "./instrument-item";
import { PatientCard } from "./patient-card";
import { QuestionCard } from "./question-card";
import { SkillBarComponent } from "./SkillBar";
import { SpeedometerComponent } from "./Speedometer";
import { TestHeader } from "./test-header";
import { TestInstruction } from "./test-instruction";

jest.mock("@expo/vector-icons", () => ({
  Feather: () => null,
  Ionicons: () => null,
}));

describe("componentes de interface reutilizáveis", () => {
  it("exibe a pontuação do velocímetro limitada ao intervalo de 0 a 30", () => {
    const { getByText, rerender } = render(<SpeedometerComponent score={-4} />);
    expect(getByText("0")).toBeTruthy();

    rerender(<SpeedometerComponent score={18} />);
    expect(getByText("18")).toBeTruthy();

    rerender(<SpeedometerComponent score={40} />);
    expect(getByText("30")).toBeTruthy();
  });

  it("apresenta rótulo e pontuação da barra de habilidade", () => {
    const { getByText } = render(
      <SkillBarComponent label="Memória" score={3} max={6} />,
    );

    expect(getByText("Memória")).toBeTruthy();
    expect(getByText("3/6")).toBeTruthy();
  });

  it("exibe os dados do paciente e formata o CPF no cartão", () => {
    const { getByText } = render(
      <PatientCard
        patient={{ nome_completo: "Maria da Silva", cpf: "12345678901" }}
      />,
    );

    expect(getByText("Maria da Silva")).toBeTruthy();
    expect(getByText("CPF: 123.456.789-01")).toBeTruthy();
  });

  it("usa a variante primária por padrão e encaminha o toque", () => {
    const onPress = jest.fn();
    const { getByText } = render(<AppButton title="Salvar" onPress={onPress} />);

    fireEvent.press(getByText("Salvar"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renderiza a variante secundária do botão", () => {
    const { getByText } = render(
      <AppButton title="Cancelar" onPress={() => {}} variant="secondary" />,
    );

    expect(getByText("Cancelar")).toBeTruthy();
  });

  it("exibe os dados do cabeçalho e os valores padrão quando estão vazios", () => {
    const { getByText, rerender } = render(
      <TestHeader
        patientName="Maria"
        instrumentName="MEEM"
        currentStep={2}
        totalSteps={12}
      />,
    );

    expect(getByText("Maria")).toBeTruthy();
    expect(getByText("MEEM")).toBeTruthy();
    expect(getByText("2/12")).toBeTruthy();

    rerender(
      <TestHeader
        patientName=""
        instrumentName=""
        currentStep={0}
        totalSteps={12}
      />,
    );

    expect(getByText("Paciente")).toBeTruthy();
    expect(getByText("Instrumento não informado")).toBeTruthy();
  });

  it("não renderiza uma instrução ausente", () => {
    const { toJSON } = render(<TestInstruction />);

    expect(toJSON()).toBeNull();
  });

  it("renderiza instruções comuns e linhas de dica na introdução", () => {
    const { getByText } = render(
      <TestInstruction
        instruction={'Leia as orientações.\n\n💡 Dica: fale com calma.'}
        isIntro
      />,
    );

    expect(getByText("Leia as orientações.")).toBeTruthy();
    expect(getByText("💡 Dica: fale com calma.")).toBeTruthy();
  });

  it("renderiza uma instrução de etapa fora da introdução", () => {
    const { getByText } = render(
      <TestInstruction instruction="Peça para repetir as palavras." />,
    );

    expect(getByText("Peça para repetir as palavras.")).toBeTruthy();
  });

  it("encaminha a resposta correta ou incorreta com o ID da pergunta", () => {
    const onAnswer = jest.fn();
    const question = {
      id: "ot_dia_mes",
      label: "Em que dia do mês estamos?",
      points: 1,
    };
    const { getByText, rerender } = render(
      <QuestionCard question={question} onAnswer={onAnswer} />,
    );

    fireEvent.press(getByText("Correto"));
    expect(onAnswer).toHaveBeenLastCalledWith("ot_dia_mes", 1);

    rerender(
      <QuestionCard question={question} currentValue={1} onAnswer={onAnswer} />,
    );
    fireEvent.press(getByText("Incorreto"));
    expect(onAnswer).toHaveBeenLastCalledWith("ot_dia_mes", 0);

    rerender(
      <QuestionCard question={question} currentValue={0} onAnswer={onAnswer} />,
    );
    expect(getByText("Em que dia do mês estamos?")).toBeTruthy();
  });

  it("exibe instrumento, abreviação e duração e chama o callback selecionado", () => {
    const onPress = jest.fn();
    const instrument = {
      id: "meem",
      nome: "Mini Exame do Estado Mental",
      abreviacao: "MEEM",
      tempo_estimado_min: 10,
      versao: "1",
      status: 1,
    };
    const { getByText } = render(
      <InstrumentItem instrument={instrument} onPress={onPress} index={1} />,
    );

    expect(getByText("Mini Exame do Estado Mental")).toBeTruthy();
    expect(getByText("MEEM")).toBeTruthy();
    expect(getByText("10-15 min")).toBeTruthy();
    fireEvent.press(getByText("Mini Exame do Estado Mental"));
    expect(onPress).toHaveBeenCalledWith(instrument);
  });

  it("usa a duração padrão quando o instrumento não informa minutos", () => {
    const instrument = {
      id: "moca",
      nome: "instrumento desconhecido",
      abreviacao: "",
      tempo_estimado_min: 0,
      versao: "1",
      status: 1,
    };
    const { getByText, queryByText } = render(
      <InstrumentItem instrument={instrument} onPress={() => {}} index={0} />,
    );

    expect(getByText("5-10 min")).toBeTruthy();
    expect(queryByText("Montreal Cognitive Assessment")).toBeNull();
  });
});
