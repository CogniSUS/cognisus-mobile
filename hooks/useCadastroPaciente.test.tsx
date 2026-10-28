import { act, renderHook } from "@testing-library/react-native";
import { PacienteRepository } from "@/database/repositories/PacienteRepository";
import { useToast } from "@/hooks/useToast";
import { useCadastroPaciente } from "./useCadastroPaciente";

jest.mock("@/database/repositories/PacienteRepository", () => ({
  PacienteRepository: {
    verificarCpfExistente: jest.fn(),
    criarComTransacao: jest.fn(),
  },
}));

jest.mock("@/hooks/useToast", () => ({ useToast: jest.fn() }));

const toast = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
};

const listaDCNT = [
  { id: "hipertensao", tipo: "Hipertensão" },
  { id: "diabetes", tipo: "Diabetes" },
  { id: "nenhuma", tipo: "Nenhuma dessas condições" },
  { id: "nao-sei", tipo: "Não sei informar" },
];

function preencherCadastro(result: {
  current: ReturnType<typeof useCadastroPaciente>;
}) {
  act(() => {
    result.current.setNome("Maria da Silva");
    result.current.setCpf("123.456.789-01");
    result.current.setDataNascimento("04/05/1990");
    result.current.setSexo("feminino");
    result.current.setEscolaridade("escolaridade-1");
  });
}

describe("useCadastroPaciente", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useToast).mockReturnValue(
      toast as unknown as ReturnType<typeof useToast>,
    );
    jest
      .mocked(PacienteRepository.verificarCpfExistente)
      .mockResolvedValue(false);
    jest
      .mocked(PacienteRepository.criarComTransacao)
      .mockResolvedValue(undefined);
  });

  it("informa quando faltam campos obrigatórios", async () => {
    const onSucesso = jest.fn();
    const { result } = renderHook(() =>
      useCadastroPaciente(onSucesso, listaDCNT),
    );

    await act(async () => {
      await result.current.cadastrarPaciente();
    });

    expect(toast.info).toHaveBeenCalledWith(
      "Preencha os campos obrigatórios",
    );
    expect(PacienteRepository.verificarCpfExistente).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it("rejeita CPF que não tem 11 dígitos", async () => {
    const { result } = renderHook(() =>
      useCadastroPaciente(jest.fn(), listaDCNT),
    );
    preencherCadastro(result);
    act(() => result.current.setCpf("123.456"));

    await act(async () => {
      await result.current.cadastrarPaciente();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "O CPF deve conter exatamente 11 dígitos",
    );
    expect(PacienteRepository.verificarCpfExistente).not.toHaveBeenCalled();
  });

  it.each([
    ["1990-05-04", "Data de nascimento inválida"],
    ["4/05/1990", "Data de nascimento inválida"],
    ["32/05/1990", "Data de nascimento inválida"],
    ["04/13/1990", "Data de nascimento inválida"],
  ])("rejeita a data de nascimento %s", async (data, mensagem) => {
    const { result } = renderHook(() =>
      useCadastroPaciente(jest.fn(), listaDCNT),
    );
    preencherCadastro(result);
    act(() => result.current.setDataNascimento(data));

    await act(async () => {
      await result.current.cadastrarPaciente();
    });

    expect(toast.error).toHaveBeenCalledWith(mensagem);
    expect(PacienteRepository.verificarCpfExistente).not.toHaveBeenCalled();
  });

  it("impede cadastrar um CPF que já existe", async () => {
    jest
      .mocked(PacienteRepository.verificarCpfExistente)
      .mockResolvedValue(true);
    const { result } = renderHook(() =>
      useCadastroPaciente(jest.fn(), listaDCNT),
    );
    preencherCadastro(result);

    await act(async () => {
      await result.current.cadastrarPaciente();
    });

    expect(PacienteRepository.verificarCpfExistente).toHaveBeenCalledWith(
      "12345678901",
    );
    expect(toast.error).toHaveBeenCalledWith(
      "Este CPF já está cadastrado no sistema.",
    );
    expect(PacienteRepository.criarComTransacao).not.toHaveBeenCalled();
  });

  it("persiste os dados normalizados e limpa o formulário após sucesso", async () => {
    const onSucesso = jest.fn();
    const { result } = renderHook(() =>
      useCadastroPaciente(onSucesso, listaDCNT),
    );
    preencherCadastro(result);
    act(() => result.current.toggleDcnt("diabetes", "Diabetes"));

    await act(async () => {
      await result.current.cadastrarPaciente();
    });

    expect(PacienteRepository.criarComTransacao).toHaveBeenCalledWith({
      nome: "Maria da Silva",
      cpf: "12345678901",
      dataNascimento: "1990-05-04",
      sexo: "feminino",
      escolaridade: "escolaridade-1",
      dcntsIds: ["diabetes"],
    });
    expect(toast.success).toHaveBeenCalledWith(
      "Paciente cadastrado com sucesso!",
    );
    expect(onSucesso).toHaveBeenCalledWith("123.456.789-01");
    expect(result.current.nome).toBe("");
    expect(result.current.cpf).toBe("");
    expect(result.current.dcntsSelecionadas).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("mostra uma mensagem amigável quando o repositório falha ao salvar", async () => {
    jest
      .mocked(PacienteRepository.criarComTransacao)
      .mockRejectedValue(new Error("falha local"));
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const { result } = renderHook(() =>
      useCadastroPaciente(jest.fn(), listaDCNT),
    );
    preencherCadastro(result);

    await act(async () => {
      await result.current.cadastrarPaciente();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Erro interno ao salvar dados no banco local.",
    );
    expect(result.current.loading).toBe(false);
    logSpy.mockRestore();
  });

  it("mantém exclusivas as opções de ausência ou desconhecimento de DCNT", () => {
    const { result } = renderHook(() =>
      useCadastroPaciente(jest.fn(), listaDCNT),
    );

    act(() => result.current.toggleDcnt("hipertensao", "Hipertensão"));
    expect(result.current.dcntsSelecionadas).toEqual(["hipertensao"]);

    act(() =>
      result.current.toggleDcnt("nenhuma", "Nenhuma dessas condições"),
    );
    expect(result.current.dcntsSelecionadas).toEqual(["nenhuma"]);

    act(() => result.current.toggleDcnt("diabetes", "Diabetes"));
    expect(result.current.dcntsSelecionadas).toEqual(["diabetes"]);

    act(() => result.current.toggleDcnt("nao-sei", "Não sei informar"));
    expect(result.current.dcntsSelecionadas).toEqual(["nao-sei"]);

    act(() => result.current.toggleDcnt("nao-sei", "Não sei informar"));
    expect(result.current.dcntsSelecionadas).toEqual([]);

    act(() => result.current.toggleDcnt("hipertensao", "Hipertensão"));
    act(() => result.current.toggleDcnt("hipertensao", "Hipertensão"));
    expect(result.current.dcntsSelecionadas).toEqual([]);
  });

  it("preserva um ID previamente selecionado que não está na lista de DCNT", () => {
    const { result } = renderHook(() =>
      useCadastroPaciente(jest.fn(), listaDCNT),
    );

    act(() => result.current.toggleDcnt("legado", "Condição antiga"));
    act(() => result.current.toggleDcnt("diabetes", "Diabetes"));

    expect(result.current.dcntsSelecionadas).toEqual(["legado", "diabetes"]);
  });

  it("registra erro inesperado se a notificação de validação lançar exceção", async () => {
    toast.info.mockImplementationOnce(() => {
      throw new Error("notificação indisponível");
    });
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const { result } = renderHook(() =>
      useCadastroPaciente(jest.fn(), listaDCNT),
    );

    await act(async () => {
      await result.current.cadastrarPaciente();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Ocorreu um erro inesperado ao cadastrar.",
    );
    expect(result.current.loading).toBe(false);
    logSpy.mockRestore();
  });
});
