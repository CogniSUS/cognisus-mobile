import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { PacienteRepository } from "@/database/repositories/PacienteRepository";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/providers/AuthProvider";
import { router, useLocalSearchParams } from "expo-router";
import { Animated, FlatList, InteractionManager } from "react-native";
import HomePage from "./(app)";

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
    sortBy: jest.fn((...args) => args),
    take: jest.fn((...args) => args),
    desc: "desc",
  },
}));
jest.mock("@react-navigation/native", () => {
  const React = require("react");
  return {
    useFocusEffect: (callback: () => void | (() => void)) =>
      React.useEffect(callback, [callback]),
  };
});
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => {
    const { View } = require("react-native");
    return <View>{children}</View>;
  },
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 12, left: 0 }),
}));
jest.mock("expo-router", () => ({
  router: { push: jest.fn(), setParams: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@/database/repositories/PacienteRepository", () => ({
  PacienteRepository: { listarTodos: jest.fn() },
}));
jest.mock("@/hooks/useToast", () => ({ useToast: jest.fn() }));
jest.mock("@/providers/AuthProvider", () => ({ useAuth: jest.fn() }));

function makePatient(
  id: string,
  nomeCompleto: string,
  cpf: string,
  ultimaAvaliacao: string | null,
  options: {
    assessments?: any[];
    escolaridade?: { fetch: jest.Mock } | null;
  } = {},
) {
  return {
    id,
    nomeCompleto,
    cpf,
    dataNascimento: "1990-05-04",
    sexo: "feminino",
    nivelEscolaridade:
      "escolaridade" in options
        ? options.escolaridade
        : { fetch: jest.fn().mockResolvedValue({ tipo: "Ensino Médio" }) },
    avaliacoes: {
      extend: jest.fn(() => ({
        fetch: jest.fn().mockResolvedValue(
          options.assessments ??
            (ultimaAvaliacao ? [{ createdAt: new Date(ultimaAvaliacao) }] : []),
        ),
      })),
    },
  };
}

describe("HomePage", () => {
  const showError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(InteractionManager, "runAfterInteractions").mockImplementation(((callback: () => void) => {
      callback();
      return { cancel: jest.fn() } as never;
    }) as never);
    jest.spyOn(Animated, "timing").mockImplementation(() => ({
      start: (callback?: (result: { finished: boolean }) => void) =>
        callback?.({ finished: true }),
    }) as never);
    jest.mocked(useAuth).mockReturnValue({
      user: { user_metadata: { nome_completo: "ANA SOUZA" }, email: "ana@example.com" },
    } as never);
    jest.mocked(useToast).mockReturnValue({ error: showError } as never);
    jest.mocked(useLocalSearchParams).mockReturnValue({} as never);
    jest.mocked(PacienteRepository.listarTodos).mockResolvedValue([
      makePatient("old", "João Antigo", "11122233344", "2024-01-01"),
      makePatient("recent", "Maria Silva", "55566677788", "2025-05-01"),
      makePatient("none", "Sem avaliação", "99988877766", null),
    ] as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("carrega pacientes, prioriza os avaliados recentes e busca por nome e CPF", async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(<HomePage />);

    expect(getByText("Olá, Ana Souza")).toBeTruthy();
    await waitFor(() => expect(getByText("Maria Silva")).toBeTruthy());
    expect(getByText("João Antigo")).toBeTruthy();
    expect(queryByText("Sem avaliação")).toBeNull();

    fireEvent.changeText(getByPlaceholderText("Digite o Nome ou CPF"), "111");
    expect(getByText("João Antigo")).toBeTruthy();
    expect(queryByText("Maria Silva")).toBeNull();
    fireEvent.changeText(getByPlaceholderText("Digite o Nome ou CPF"), "maria");
    expect(getByText("Maria Silva")).toBeTruthy();
    fireEvent.changeText(getByPlaceholderText("Digite o Nome ou CPF"), "sem resultado");
    expect(getByText("Paciente não encontrado")).toBeTruthy();
    fireEvent.press(getByText("close"));
    expect(getByPlaceholderText("Digite o Nome ou CPF").props.value).toBe("");
    expect(getByText("Maria Silva")).toBeTruthy();
  });

  it("preenche busca por CPF inicial e permite abrir cadastro e edição", async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({
      cpfBuscaInicial: "12345678901",
    } as never);
    jest.mocked(PacienteRepository.listarTodos).mockResolvedValue([
      makePatient("p1", "Maria Silva", "12345678901", "2025-05-01"),
    ] as never);
    const { getByText, getByPlaceholderText } = render(<HomePage />);

    expect(getByPlaceholderText("Digite o Nome ou CPF").props.value).toBe(
      "123.456.789-01",
    );
    expect(router.setParams).toHaveBeenCalledWith({ cpfBuscaInicial: undefined });
    await waitFor(() => expect(getByText("Maria Silva")).toBeTruthy());

    fireEvent.press(getByText("edit-2"));
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/(app)/patients/edit",
      params: { id: "p1" },
    });

    fireEvent.changeText(getByPlaceholderText("Digite o Nome ou CPF"), "999.888.777-66");
    fireEvent.press(getByText("Cadastrar Novo Paciente"));
    expect(router.push).toHaveBeenLastCalledWith({
      pathname: "/(app)/patients/create",
      params: { cpfInicial: "99988877766" },
    });
  });

  it("abre e fecha a confirmação de identidade e direciona ao rastreio", async () => {
    const { getByText } = render(<HomePage />);
    await waitFor(() => expect(getByText("Maria Silva")).toBeTruthy());

    fireEvent.press(getByText("Maria Silva"));
    expect(getByText("Confirmação de Identidade")).toBeTruthy();
    expect(getByText(/Escolaridade:.*Ensino Médio/)).toBeTruthy();
    fireEvent.press(getByText("INICIAR RASTREIO"));

    expect(router.push).toHaveBeenCalledWith({
      pathname: "/tests/select-instrument",
      params: expect.objectContaining({
        patientId: "recent",
        nome: "Maria Silva",
        escolaridade: "Ensino Médio",
      }),
    });
  });

  it("exibe lista vazia, busca sem resultado e erro de leitura", async () => {
    jest.mocked(PacienteRepository.listarTodos).mockResolvedValue([]);
    const empty = render(<HomePage />);
    await waitFor(() =>
      expect(empty.getByText("Nenhuma avaliação recente encontrada.")).toBeTruthy(),
    );
    fireEvent.changeText(
      empty.getByPlaceholderText("Digite o Nome ou CPF"),
      "999",
    );
    expect(empty.getByText("Paciente não encontrado")).toBeTruthy();
    empty.unmount();

    jest.mocked(PacienteRepository.listarTodos).mockRejectedValue(
      new Error("banco indisponível"),
    );
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const failed = render(<HomePage />);
    await waitFor(() =>
      expect(showError).toHaveBeenCalledWith(
        "Não foi possível carregar a lista de pacientes.",
      ),
    );
    expect(failed.getByText("Nenhuma avaliação recente encontrada.")).toBeTruthy();
    errorSpy.mockRestore();
  });

  it("mantém o paciente visível quando uma relação complementar falha", async () => {
    const patient = makePatient("broken", "Paciente sem relação", "11122233344", null, {
      assessments: [{ createdAt: new Date("2025-06-01T00:00:00.000Z") }],
      escolaridade: {
        fetch: jest.fn().mockRejectedValue(new Error("escolaridade indisponível")),
      },
    });
    jest.mocked(PacienteRepository.listarTodos).mockResolvedValue([patient] as never);
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const screen = render(<HomePage />);

    await waitFor(() => expect(warnSpy).toHaveBeenCalledWith(
      "Aviso: Falha ao carregar dependências do paciente broken",
    ));
    expect(screen.getByText("Paciente sem relação")).toBeTruthy();
    warnSpy.mockRestore();
  });

  it("usa nome profissional alternativo e as datas/relacionamentos de avaliação disponíveis", async () => {
    jest.mocked(useAuth).mockReturnValue({
      user: { email: "medica@exemplo.com" },
    } as never);
    jest.mocked(PacienteRepository.listarTodos).mockResolvedValue([
      makePatient("fim", "Com data fim", "11111111111", null, {
        assessments: [{ dataFim: "2025-07-01", createdAt: "2025-06-01T00:00:00.000Z" }],
        escolaridade: null,
      }),
      makePatient("inicio", "Com data início", "22222222222", null, {
        assessments: [{ dataInicio: "2025-06-01" }],
        escolaridade: null,
      }),
      makePatient("sem-data", "Sem data", "33333333333", null, {
        assessments: [{}],
        escolaridade: null,
      }),
    ] as never);
    const screen = render(<HomePage />);

    expect(screen.getByText("Olá, Medica@exemplo.com")).toBeTruthy();
    await waitFor(() => expect(screen.getByText("Com data fim")).toBeTruthy());
    fireEvent.changeText(screen.getByPlaceholderText("Digite o Nome ou CPF"), "com data início");
    expect(screen.getByText("Com data início")).toBeTruthy();
    fireEvent.changeText(screen.getByPlaceholderText("Digite o Nome ou CPF"), "sem data");
    expect(screen.getByText("Sem data")).toBeTruthy();
    expect(screen.getByText(/Nenhuma/)).toBeTruthy();

    fireEvent.press(screen.getByText("Sem data"));
    expect(screen.getByText(/Escolaridade:.*Não informada/)).toBeTruthy();
    fireEvent.press(screen.getByText("Voltar / Cancelar"));
  });

  it("atualiza silenciosamente e não mostra erro durante uma atualização falha", async () => {
    jest.mocked(PacienteRepository.listarTodos).mockResolvedValue([]);
    const screen = render(<HomePage />);
    await waitFor(() =>
      expect(screen.getByText("Nenhuma avaliação recente encontrada.")).toBeTruthy(),
    );
    jest.mocked(PacienteRepository.listarTodos).mockRejectedValue(
      new Error("erro durante atualização"),
    );
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const list = screen.UNSAFE_getByType(FlatList);

    await act(async () => {
      await list.props.refreshControl.props.onRefresh();
    });
    expect(PacienteRepository.listarTodos).toHaveBeenCalledTimes(2);
    expect(showError).not.toHaveBeenCalled();
    expect(screen.getByText("Nenhuma avaliação recente encontrada.")).toBeTruthy();
    errorSpy.mockRestore();
  });

  it("tenta novamente até o limite e cancela a próxima tentativa ao desmontar", async () => {
    jest.mocked(PacienteRepository.listarTodos).mockResolvedValue([]);
    const callbacks: (() => Promise<void>)[] = [];
    const realSetTimeout = global.setTimeout;
    const timeoutSpy = jest.spyOn(global, "setTimeout").mockImplementation(((
      callback: TimerHandler,
      delay?: number,
      ...args: unknown[]
    ) => {
      if (delay === 2000 && typeof callback === "function") {
        callbacks.push(callback as () => Promise<void>);
        return 987 as never;
      }
      return realSetTimeout(callback, delay, ...args);
    }) as never);
    const clearSpy = jest.spyOn(global, "clearTimeout");
    const screen = render(<HomePage />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(callbacks).toHaveLength(1);

    for (let retry = 0; retry < 4; retry += 1) {
      const callback = callbacks.shift();
      expect(callback).toBeDefined();
      await act(async () => callback?.());
      if (retry < 3) expect(callbacks).toHaveLength(1);
    }
    expect(PacienteRepository.listarTodos).toHaveBeenCalledTimes(5);
    expect(callbacks).toHaveLength(0);

    screen.unmount();
    expect(clearSpy).toHaveBeenCalledWith(987);
    expect(timeoutSpy).toHaveBeenCalled();
  });

  it("usa o nome profissional padrão sem usuário autenticado", async () => {
    jest.mocked(useAuth).mockReturnValue({ user: null } as never);
    const screen = render(<HomePage />);
    expect(screen.getByText("Olá, Profissional")).toBeTruthy();
    await waitFor(() => expect(screen.getByText("Maria Silva")).toBeTruthy());
  });
});
