import { fireEvent, render } from "@testing-library/react-native";
import { useCadastroPaciente } from "@/hooks/useCadastroPaciente";
import { useDominios } from "@/hooks/useDominios";
import { router, useLocalSearchParams } from "expo-router";
import PatientCreatePage from "./(app)/patients/create";

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
jest.mock("expo-router", () => ({
  router: { back: jest.fn(), replace: jest.fn() },
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
jest.mock("@/hooks/useCadastroPaciente", () => ({
  useCadastroPaciente: jest.fn(),
}));
jest.mock("@/hooks/useDominios", () => ({ useDominios: jest.fn() }));

describe("PatientCreatePage", () => {
  const setNome = jest.fn();
  const setCpf = jest.fn();
  const setDataNascimento = jest.fn();
  const setSexo = jest.fn();
  const setEscolaridade = jest.fn();
  const toggleDcnt = jest.fn();
  const cadastrarPaciente = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useLocalSearchParams).mockReturnValue({
      cpfInicial: "12345678901",
    } as never);
    jest.mocked(useDominios).mockReturnValue({
      listaEscolaridade: [{ id: "school-1", tipo: "ensino médio" }],
      listaDCNT: [
        { id: "d1", tipo: "Diabetes" },
        { id: "d2", tipo: "Hipertensão" },
      ],
    } as never);
    jest.mocked(useCadastroPaciente).mockReturnValue({
      nome: "Maria Silva",
      setNome,
      cpf: "123.456.789-01",
      setCpf,
      dataNascimento: "04/05/1990",
      setDataNascimento,
      sexo: "feminino",
      setSexo,
      escolaridade: "school-1",
      setEscolaridade,
      dcntsSelecionadas: ["d1"],
      loading: false,
      toggleDcnt,
      cadastrarPaciente,
    } as never);
  });

  it("apresenta e conecta campos, opções, condições e ações do cadastro", () => {
    const { getByText, getByPlaceholderText } = render(<PatientCreatePage />);

    expect(getByText("Cadastro de Paciente")).toBeTruthy();
    expect(getByPlaceholderText("Nome completo").props.value).toBe("Maria Silva");
    expect(getByPlaceholderText("Digite seu CPF").props.value).toBe("123.456.789-01");
    expect(setCpf).toHaveBeenCalledWith("123.456.789-01");
    expect(getByPlaceholderText("Data de nascimento").props.value).toBe("04/05/1990");
    expect(getByText("Ensino Médio")).toBeTruthy();

    fireEvent.changeText(getByPlaceholderText("Nome completo"), "Ana Souza");
    fireEvent.changeText(getByPlaceholderText("Digite seu CPF"), "11122233344");
    fireEvent.changeText(getByPlaceholderText("Data de nascimento"), "01021980");
    expect(setNome).toHaveBeenCalledWith("Ana Souza");
    expect(setCpf).toHaveBeenLastCalledWith("111.222.333-44");
    expect(setDataNascimento).toHaveBeenCalledWith("01/02/1980");

    fireEvent.press(getByText("Masculino"));
    fireEvent.press(getByText("Ensino Médio"));
    fireEvent.press(getByText("Diabetes"));
    expect(setSexo).toHaveBeenCalledWith("masculino");
    expect(setEscolaridade).toHaveBeenCalledWith("school-1");
    expect(toggleDcnt).toHaveBeenCalledWith("d1", "Diabetes");

    fireEvent.press(getByText("arrow-left"));
    fireEvent.press(getByText("Cancelar"));
    fireEvent.press(getByText("Confirmar"));
    expect(router.back).toHaveBeenCalledTimes(2);
    expect(cadastrarPaciente).toHaveBeenCalledTimes(1);
  });

  it("não aplica CPF inicial ausente e mostra o estado de salvamento", () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({} as never);
    jest.mocked(useCadastroPaciente).mockReturnValue({
      nome: "",
      setNome,
      cpf: "",
      setCpf,
      dataNascimento: "",
      setDataNascimento,
      sexo: "",
      setSexo,
      escolaridade: null,
      setEscolaridade,
      dcntsSelecionadas: [],
      loading: true,
      toggleDcnt,
      cadastrarPaciente,
    } as never);

    const { getByText, queryByText } = render(<PatientCreatePage />);

    expect(setCpf).not.toHaveBeenCalled();
    expect(getByText("Cadastro de Paciente")).toBeTruthy();
    expect(queryByText("Confirmar")).toBeNull();
  });
});
