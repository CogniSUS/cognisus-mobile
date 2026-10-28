import { fireEvent, render } from "@testing-library/react-native";
import { usePacienteInformation } from "@/hooks/usePacienteInformation";
import { router, useLocalSearchParams } from "expo-router";
import PatientInformation from "./(app)/patients/patient-information";

jest.mock("@expo/vector-icons", () => ({
  Feather: ({ name }: { name: string }) => {
    const { Text } = require("react-native");
    return <Text>{name}</Text>;
  },
  Ionicons: () => null,
}));
jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@/hooks/usePacienteInformation", () => ({
  usePacienteInformation: jest.fn(),
}));

describe("PatientInformation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useLocalSearchParams).mockReturnValue({
      patientId: "patient-1",
    } as never);
  });

  it("recebe o identificador e exibe o estado de carregamento", () => {
    jest.mocked(usePacienteInformation).mockReturnValue({
      paciente: null,
      loading: true,
    } as never);
    const { getByText } = render(<PatientInformation />);

    expect(usePacienteInformation).toHaveBeenCalledWith("patient-1");
    expect(getByText("Carregando ficha...")).toBeTruthy();
  });

  it("formata e exibe dados pessoais, saúde e avaliação recente", () => {
    jest.mocked(usePacienteInformation).mockReturnValue({
      loading: false,
      paciente: {
        nome_completo: "MARIA DA SILVA",
        cpf: "12345678901",
        data_nascimento: "1990-05-04",
        sexo: "FEMININO",
        escolaridade_nome: "ENSINO MÉDIO",
        dcnts: "DIABETES",
        ultima_avaliacao: "2025-06-15T12:00:00.000Z",
      },
    } as never);
    const { getByText } = render(<PatientInformation />);

    expect(getByText("Maria da Silva")).toBeTruthy();
    expect(getByText("CPF: 123.456.789-01")).toBeTruthy();
    expect(getByText("ESCOLARIDADE")).toBeTruthy();
    expect(getByText("Ensino Médio")).toBeTruthy();
    expect(getByText("Diabetes")).toBeTruthy();
    expect(getByText("Última avaliação")).toBeTruthy();
    fireEvent.press(getByText("arrow-left"));
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it("apresenta valores de fallback quando não há paciente nem data", () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({} as never);
    jest.mocked(usePacienteInformation).mockReturnValue({
      paciente: null,
      loading: false,
    } as never);
    const { getByText, getAllByText } = render(<PatientInformation />);

    expect(usePacienteInformation).toHaveBeenCalledWith(null);
    expect(getByText("Paciente não identificado")).toBeTruthy();
    expect(getByText("CPF: Não informado")).toBeTruthy();
    expect(getAllByText("Não informada")).toHaveLength(3);
    // O CPF inclui o prefixo nessa mesma consulta e o sexo é o único texto isolado.
    expect(getAllByText("Não informado")).toHaveLength(1);
    expect(getByText("Nenhuma DCNT cadastrada")).toBeTruthy();
    expect(getByText("Nenhuma avaliação")).toBeTruthy();
  });
});
