import { fireEvent, render } from "@testing-library/react-native";
import { TestAbandonModal } from "./test-abandon-modal";
import { TestConfirmationModal } from "./test-confirmation-modal";
import type { Patient } from "@/types/patient";

jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));

const patient: Patient = {
  id: "patient-1",
  nome_completo: "Maria da Silva",
  cpf: "12345678901",
  data_nascimento: "1990-01-01",
  sexo: "feminino",
};
const instrument = {
  id: "meem",
  nome: "Mini Exame do Estado Mental",
  abreviacao: "MEEM",
  tempo_estimado_min: 10,
  versao: "1",
  status: 1,
};

describe("modais de avaliação", () => {
  it("exibe dados e encaminha confirmar ou cancelar o início", () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const { getByText } = render(
      <TestConfirmationModal
        visible
        patient={patient}
        instrument={instrument}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(getByText("Maria da Silva")).toBeTruthy();
    expect(getByText("MEEM")).toBeTruthy();
    fireEvent.press(getByText("Confirmar e Iniciar"));
    fireEvent.press(getByText("Cancelar"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("mostra o indicador e desabilita ações de confirmação durante carregamento", () => {
    const onCancel = jest.fn();
    const { queryByText, getByText } = render(
      <TestConfirmationModal
        visible
        patient={patient}
        instrument={instrument}
        onConfirm={() => {}}
        onCancel={onCancel}
        isLoading
      />,
    );

    expect(queryByText("Confirmar e Iniciar")).toBeNull();
    fireEvent.press(getByText("Cancelar"));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("apresenta o progresso do abandono e encaminha as escolhas", () => {
    const onConfirmAbandon = jest.fn();
    const onCancel = jest.fn();
    const { getByText } = render(
      <TestAbandonModal
        visible
        patientName="Maria"
        instrumentName="MEEM"
        currentStep={3}
        totalSteps={12}
        onConfirmAbandon={onConfirmAbandon}
        onCancel={onCancel}
      />,
    );

    expect(getByText("Maria")).toBeTruthy();
    expect(getByText("3 de 12 etapas")).toBeTruthy();
    fireEvent.press(getByText("Continuar Avaliação"));
    fireEvent.press(getByText("Sair e Perder Dados"));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirmAbandon).toHaveBeenCalledTimes(1);
  });

  it("desabilita as ações do abandono durante carregamento", () => {
    const onCancel = jest.fn();
    const { queryByText, getByText } = render(
      <TestAbandonModal
        visible
        patientName="Maria"
        instrumentName="MEEM"
        currentStep={0}
        totalSteps={0}
        onConfirmAbandon={() => {}}
        onCancel={onCancel}
        isLoading
      />,
    );

    expect(queryByText("Sair e Perder Dados")).toBeNull();
    fireEvent.press(getByText("Continuar Avaliação"));
    expect(onCancel).not.toHaveBeenCalled();
  });
});
