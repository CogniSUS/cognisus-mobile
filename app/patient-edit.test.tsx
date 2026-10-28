import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { database } from "@/database/database";
import { useToast } from "@/hooks/useToast";
import { router, useLocalSearchParams } from "expo-router";
import PatientEditPage from "./(app)/patients/edit";

jest.mock("@expo/vector-icons", () => ({
  AntDesign: () => null,
  Feather: ({ name }: { name: string }) => {
    const { Text } = require("react-native");
    return <Text>{name}</Text>;
  },
  FontAwesome: () => null,
  FontAwesome5: () => null,
  Ionicons: () => null,
}));
jest.mock("@nozbe/watermelondb", () => ({
  Q: { where: jest.fn((...args) => args) },
}));
jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@/components/ui/CustomSelect", () => ({
  CustomSelect: ({
    options,
    onValueChange,
  }: {
    options: { label: string; value: string }[];
    onValueChange: (value: string) => void;
  }) => {
    const { Text, TouchableOpacity, View } = require("react-native");
    return (
      <View>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onValueChange(option.value)}
          >
            <Text>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  },
}));
jest.mock("@/database/database", () => ({
  database: {
    write: jest.fn(),
    collections: { get: jest.fn() },
  },
}));
jest.mock("@/hooks/useToast", () => ({ useToast: jest.fn() }));

describe("PatientEditPage", () => {
  const showSuccess = jest.fn();
  const showError = jest.fn();
  const updatePatient = jest.fn(async (update: (patient: any) => void) => {
    update(patient);
  });
  const patient = {
    id: "patient-1",
    nomeCompleto: "Maria Silva",
    dataNascimento: "1990-05-04",
    sexo: "feminino",
    nivelEscolaridade: { id: "school-1" },
    update: updatePatient,
  };
  const markAsDeleted = jest.fn().mockResolvedValue(undefined);
  const createRelation = jest.fn(async (create: (relation: any) => void) => {
    const relation = { paciente: { id: "" }, dcnt: { id: "" } };
    create(relation);
    return relation;
  });
  const findPatient = jest.fn();
  const escolaridadeCollection = {
    query: () => ({
      fetch: jest.fn().mockResolvedValue([
        { id: "school-1", tipo: "Ensino Médio" },
        { id: "school-0", tipo: "Analfabeto" },
      ]),
    }),
  };
  const dcntCollection = {
    query: () => ({
      fetch: jest.fn().mockResolvedValue([
        { id: "d1", tipo: "Diabetes" },
        { id: "d2", tipo: "Hipertensão" },
        { id: "none", tipo: "Nenhuma dessas condições" },
        { id: "unknown", tipo: "Não sei informar" },
      ]),
    }),
  };
  const relacoesCollection = {
    query: jest.fn(() => ({
      fetch: jest.fn().mockResolvedValue([
        { dcnt: { id: "d1" }, markAsDeleted },
      ]),
    })),
    create: createRelation,
  };
  const pacienteCollection = { find: findPatient };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: "patient-1" } as never);
    jest.mocked(useToast).mockReturnValue({
      success: showSuccess,
      error: showError,
    } as never);
    findPatient.mockResolvedValue(patient);
    jest.mocked(database.collections.get).mockImplementation(((table: string) => {
      const collections: Record<string, unknown> = {
        escolaridade: escolaridadeCollection,
        dcnt: dcntCollection,
        paciente: pacienteCollection,
        paciente_dcnt: relacoesCollection,
      };
      return collections[table] as never;
    }) as never);
    jest.mocked(database.write).mockImplementation((async (work: unknown) =>
      (work as () => Promise<void>)()) as never);
  });

  it("carrega e apresenta os dados e condições atuais do paciente", async () => {
    const { getByText, getByPlaceholderText } = render(<PatientEditPage />);

    await waitFor(() => expect(getByText("Nenhuma dessas condições")).toBeTruthy());
    expect(getByText("Editar Paciente")).toBeTruthy();
    expect(getByPlaceholderText("Nome completo").props.value).toBe("Maria Silva");
    expect(getByPlaceholderText("Data de nascimento").props.value).toBe("04/05/1990");
    expect(getByText("Analfabeto")).toBeTruthy();
    expect(getByText("Ensino Médio")).toBeTruthy();
    expect(database.collections.get).toHaveBeenCalledWith("paciente");
    expect(findPatient).toHaveBeenCalledWith("patient-1");
  });

  it("valida campos obrigatórios e formatos de data antes de gravar", async () => {
    findPatient.mockResolvedValue({ ...patient, nomeCompleto: "" });
    const { getByText, getByPlaceholderText } = render(<PatientEditPage />);
    await waitFor(() => expect(getByText("Confirmar")).toBeTruthy());

    fireEvent.press(getByText("Confirmar"));
    expect(showError).toHaveBeenCalledWith("Preencha os campos obrigatórios");
    expect(database.write).not.toHaveBeenCalled();

    findPatient.mockResolvedValue(patient);
    const second = render(<PatientEditPage />);
    await waitFor(() => expect(second.getByText("Confirmar")).toBeTruthy());
    fireEvent.changeText(
      second.getByPlaceholderText("Data de nascimento"),
      "01/13/2000",
    );
    fireEvent.press(second.getByText("Confirmar"));
    expect(showError).toHaveBeenLastCalledWith("Data inválida");
    fireEvent.changeText(second.getByPlaceholderText("Data de nascimento"), "1/2/2000");
    fireEvent.press(second.getByText("Confirmar"));
    expect(showError).toHaveBeenLastCalledWith("Data inválida");
    expect(database.write).not.toHaveBeenCalled();
    expect(getByPlaceholderText("Nome completo").props.value).toBe("");
  });

  it("atualiza o paciente, substitui vínculos e permite alternar condições exclusivas", async () => {
    const { getByText } = render(<PatientEditPage />);
    await waitFor(() => expect(getByText("Nenhuma dessas condições")).toBeTruthy());

    fireEvent.press(getByText("Nenhuma dessas condições"));
    fireEvent.press(getByText("Diabetes"));
    fireEvent.press(getByText("Diabetes"));
    fireEvent.press(getByText("Não sei informar"));
    fireEvent.press(getByText("Não sei informar"));
    fireEvent.press(getByText("Hipertensão"));
    fireEvent.press(getByText("Cancelar"));
    expect(router.back).toHaveBeenCalledTimes(1);

    fireEvent.press(getByText("Confirmar"));
    await waitFor(() =>
      expect(showSuccess).toHaveBeenCalledWith("Paciente atualizado com sucesso!"),
    );
    expect(updatePatient).toHaveBeenCalled();
    expect(patient.dataNascimento).toBe("1990-05-04");
    expect(markAsDeleted).toHaveBeenCalledTimes(1);
    expect(createRelation).toHaveBeenCalled();
    expect(router.back).toHaveBeenCalledTimes(2);
  });

  it("mostra erro se a consulta inicial do paciente falhar", async () => {
    findPatient.mockRejectedValue(new Error("registro indisponível"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const { getByText } = render(<PatientEditPage />);

    await waitFor(() =>
      expect(showError).toHaveBeenCalledWith(
        "Não foi possível carregar os dados do paciente.",
      ),
    );
    expect(getByText("Editar Paciente")).toBeTruthy();
    errorSpy.mockRestore();
  });

  it("apresenta erro e encerra o salvamento se a transação falhar", async () => {
    jest.mocked(database.write).mockRejectedValue(new Error("write falhou"));
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const { getByText } = render(<PatientEditPage />);
    await waitFor(() => expect(getByText("Confirmar")).toBeTruthy());

    fireEvent.press(getByText("Confirmar"));

    await waitFor(() =>
      expect(showError).toHaveBeenCalledWith("Erro ao atualizar o paciente."),
    );
    expect(showSuccess).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });
});
