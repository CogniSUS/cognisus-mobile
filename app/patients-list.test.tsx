import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { database } from "@/database/database";
import { PacienteRepository } from "@/database/repositories/PacienteRepository";
import { useToast } from "@/hooks/useToast";
import { router } from "expo-router";
import { FlatList } from "react-native";
import PatientsPage from "./(app)/patients/index";

jest.mock("@expo/vector-icons", () => ({
  Feather: ({ name }: { name: string }) => {
    const { Text } = require("react-native");
    return <Text>{name}</Text>;
  },
  Ionicons: ({ name }: { name: string }) => {
    const { Text } = require("react-native");
    return <Text>{name}</Text>;
  },
}));
jest.mock("@nozbe/watermelondb", () => ({
  Q: {
    sortBy: jest.fn((...args) => ({ sortBy: args })),
    take: jest.fn((...args) => ({ take: args })),
  },
}));
jest.mock("@react-navigation/native", () => {
  const React = require("react");
  return {
    useFocusEffect: (callback: () => void | (() => void)) =>
      React.useEffect(callback, [callback]),
  };
});
jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@/database/database", () => ({
  database: {
    write: jest.fn(),
    collections: { get: jest.fn() },
  },
}));
jest.mock("@/database/repositories/PacienteRepository", () => ({
  PacienteRepository: { listarTodos: jest.fn() },
}));
jest.mock("@/hooks/useToast", () => ({ useToast: jest.fn() }));

function makePatient(
  id: string,
  nomeCompleto: string,
  cpf: string,
  fetchEvaluations = jest.fn().mockResolvedValue([]),
  extras: { sexo?: string; nivelEscolaridade?: { id: string } | null } = {},
) {
  return {
    id,
    nomeCompleto,
    cpf,
    dataNascimento: "1990-05-04",
    sexo: extras.sexo ?? "FEMININO",
    nivelEscolaridade:
      "nivelEscolaridade" in extras
        ? extras.nivelEscolaridade
        : { id: "ensino-medio" },
    avaliacoes: {
      extend: jest.fn(() => ({ fetch: fetchEvaluations })),
    },
  };
}

describe("PatientsPage", () => {
  const showSuccess = jest.fn();
  const showError = jest.fn();
  const markAsDeleted = jest.fn().mockResolvedValue(undefined);
  const findPatient = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useToast).mockReturnValue({
      success: showSuccess,
      error: showError,
    } as never);
    jest.mocked(PacienteRepository.listarTodos).mockResolvedValue([]);
    jest.mocked(database.collections.get).mockReturnValue({
      find: findPatient,
    } as never);
    jest.mocked(database.write).mockImplementation(async (work) =>
      (work as () => Promise<void>)(),
    );
    findPatient.mockResolvedValue({ markAsDeleted });
  });

  it("exibe carregamento e depois lista pacientes em ordem alfabética", async () => {
    let resolvePatients!: (patients: any[]) => void;
    jest.mocked(PacienteRepository.listarTodos).mockReturnValue(
      new Promise<any[]>((resolve) => { resolvePatients = resolve; }) as never,
    );
    const { getByText } = render(<PatientsPage />);

    expect(getByText("Carregando pacientes...")).toBeTruthy();
    await act(async () =>
      resolvePatients([
        makePatient("b", "Zélia", "11122233344"),
        makePatient("a", "Ana", "55566677788"),
      ]),
    );

    await waitFor(() => expect(getByText("Ana")).toBeTruthy());
    expect(getByText("Zélia")).toBeTruthy();
  });

  it("filtra por nome ou dígitos do CPF e limpa a busca", async () => {
    jest.mocked(PacienteRepository.listarTodos).mockResolvedValue([
      makePatient("1", "Maria Silva", "12345678901"),
      makePatient("2", "João Souza", "98765432100"),
    ] as never);
    const { getByPlaceholderText, getByText, getByLabelText, queryByText } =
      render(<PatientsPage />);
    await waitFor(() => expect(getByText("Maria Silva")).toBeTruthy());

    fireEvent.changeText(getByPlaceholderText("Buscar por nome ou CPF"), "987");
    expect(getByText("João Souza")).toBeTruthy();
    expect(queryByText("Maria Silva")).toBeNull();

    fireEvent.changeText(getByPlaceholderText("Buscar por nome ou CPF"), "Maria");
    expect(getByText("Maria Silva")).toBeTruthy();
    expect(queryByText("João Souza")).toBeNull();

    fireEvent.press(getByLabelText("Limpar busca"));
    expect(getByText("Maria Silva")).toBeTruthy();
    expect(getByText("João Souza")).toBeTruthy();
  });

  it("mostra vazio distinto para lista sem registros e busca sem resultado", async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(
      <PatientsPage />,
    );
    await waitFor(() =>
      expect(getByText("Nenhum paciente cadastrado")).toBeTruthy(),
    );

    fireEvent.changeText(getByPlaceholderText("Buscar por nome ou CPF"), "inexistente");
    expect(getByText("Nenhum paciente encontrado")).toBeTruthy();
    expect(queryByText("Nenhum paciente cadastrado")).toBeNull();
  });

  it("abre cadastro, detalhes, edição e confirma exclusão local", async () => {
    const patient = makePatient("patient-1", "Maria Silva", "12345678901");
    jest.mocked(PacienteRepository.listarTodos).mockResolvedValue([patient] as never);
    const { getByText, getByLabelText, queryByText } = render(<PatientsPage />);
    await waitFor(() => expect(getByText("Maria Silva")).toBeTruthy());

    fireEvent.press(getByLabelText("Cadastrar novo paciente"));
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/patients/create",
      params: { abrirCadastro: "true" },
    });
    fireEvent.press(getByText("Maria Silva"));
    expect(router.push).toHaveBeenLastCalledWith({
      pathname: "/(app)/patients/patient-information",
      params: { patientId: "patient-1" },
    });
    fireEvent.press(getByLabelText("Editar paciente Maria Silva"), {
      stopPropagation: jest.fn(),
    });
    expect(router.push).toHaveBeenLastCalledWith({
      pathname: "/patients/edit",
      params: { id: "patient-1" },
    });

    fireEvent.press(getByLabelText("Excluir paciente Maria Silva"), {
      stopPropagation: jest.fn(),
    });
    expect(getByText("Excluir paciente?")).toBeTruthy();
    await act(async () => fireEvent.press(getByText("Sim, excluir paciente")));

    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith(
      "Paciente excluído com sucesso.",
    ));
    expect(database.collections.get).toHaveBeenCalledWith("paciente");
    expect(findPatient).toHaveBeenCalledWith("patient-1");
    expect(markAsDeleted).toHaveBeenCalledTimes(1);
    expect(queryByText("Maria Silva")).toBeNull();
  });

  it("mantém o paciente quando falha a busca de relações complementares", async () => {
    const relationError = jest.fn().mockRejectedValue(new Error("relação ausente"));
    jest.mocked(PacienteRepository.listarTodos).mockResolvedValue([
      makePatient("1", "Maria Silva", "12345678901", relationError),
    ] as never);
    const warningSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { getByText } = render(<PatientsPage />);
    await waitFor(() => expect(getByText("Maria Silva")).toBeTruthy());
    expect(warningSpy).toHaveBeenCalled();
    warningSpy.mockRestore();
  });

  it("notifica falha ao carregar a lista de pacientes", async () => {
    jest.mocked(PacienteRepository.listarTodos).mockRejectedValue(
      new Error("banco indisponível"),
    );
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const { getByText } = render(<PatientsPage />);

    await waitFor(() =>
      expect(showError).toHaveBeenCalledWith(
        "Não foi possível carregar os pacientes.",
      ),
    );
    expect(getByText("Nenhum paciente cadastrado")).toBeTruthy();
    errorSpy.mockRestore();
  });

  it("mantém o paciente e informa quando a exclusão falha", async () => {
    jest.mocked(PacienteRepository.listarTodos).mockResolvedValue([
      makePatient("patient-1", "Maria Silva", "12345678901"),
    ] as never);
    markAsDeleted.mockRejectedValueOnce(new Error("falha ao excluir"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const screen = render(<PatientsPage />);
    await waitFor(() => expect(screen.getByText("Maria Silva")).toBeTruthy());

    fireEvent.press(screen.getByLabelText("Excluir paciente Maria Silva"), {
      stopPropagation: jest.fn(),
    });
    await act(async () => fireEvent.press(screen.getByText("Sim, excluir paciente")));

    await waitFor(() => expect(showError).toHaveBeenCalledWith(
      "Não foi possível excluir o paciente.",
    ));
    expect(screen.getByText("Maria Silva")).toBeTruthy();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("mapeia datas de avaliação, unidade ausente e sexo não reconhecido", async () => {
    const fetchUnit = jest.fn().mockResolvedValue({ nome: "UBS CENTRAL" });
    const fetchNoUnit = jest.fn().mockResolvedValue(null);
    jest.mocked(PacienteRepository.listarTodos).mockResolvedValue([
      makePatient(
        "fim",
        "Paciente Data Fim",
        "11122233344",
        jest.fn().mockResolvedValue([
          {
            dataFim: "2025-06-01",
            unidadeSaude: { fetch: fetchUnit },
          },
        ]),
      ),
      makePatient(
        "inicio",
        "Paciente Data Início",
        "22233344455",
        jest.fn().mockResolvedValue([
          {
            dataInicio: "2025-05-01",
            unidadeSaude: { fetch: fetchNoUnit },
          },
        ]),
        { sexo: "VALOR DESCONHECIDO", nivelEscolaridade: null },
      ),
      makePatient(
        "created",
        "Paciente Created At",
        "33344455566",
        jest.fn().mockResolvedValue([
          { createdAt: new Date("2025-04-01T12:00:00.000Z") },
        ]),
      ),
    ] as never);
    const { getByText } = render(<PatientsPage />);

    await waitFor(() => expect(getByText("Paciente Data Fim")).toBeTruthy());
    expect(getByText("UBS CENTRAL")).toBeTruthy();
    expect(getByText("Último teste: 01/06/2025")).toBeTruthy();
    expect(getByText("Último teste: 01/05/2025")).toBeTruthy();
    expect(getByText("Último teste: 01/04/2025")).toBeTruthy();
    expect(getByText(/anos • Outro/)).toBeTruthy();
    expect(fetchUnit).toHaveBeenCalledTimes(1);
    expect(fetchNoUnit).toHaveBeenCalledTimes(1);
  });

  it("atualiza a lista sem indicador inicial e apresenta erro se o refresh falhar", async () => {
    jest.mocked(PacienteRepository.listarTodos).mockResolvedValue([
      makePatient("1", "Maria Silva", "12345678901"),
    ] as never);
    const { getByText, UNSAFE_getByType } = render(<PatientsPage />);
    await waitFor(() => expect(getByText("Maria Silva")).toBeTruthy());
    jest.mocked(PacienteRepository.listarTodos).mockRejectedValue(
      new Error("refresh indisponível"),
    );
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const list = UNSAFE_getByType(FlatList);

    await act(async () => {
      await list.props.refreshControl.props.onRefresh();
    });
    expect(PacienteRepository.listarTodos).toHaveBeenCalledTimes(2);
    expect(showError).toHaveBeenCalledWith("Não foi possível carregar os pacientes.");
    expect(getByText("Maria Silva")).toBeTruthy();
    errorSpy.mockRestore();
  });
});
