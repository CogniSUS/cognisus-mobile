import { act, renderHook } from "@testing-library/react-native";
import { PacienteRepository } from "@/database/repositories/PacienteRepository";
import { useToast } from "@/hooks/useToast";
import { useBuscaPaciente } from "./useBuscaPaciente";

jest.mock("@/database/repositories/PacienteRepository", () => ({
  PacienteRepository: { buscarPorCpfComEscolaridadeEAvaliacao: jest.fn() },
}));
jest.mock("@/hooks/useToast", () => ({ useToast: jest.fn() }));
jest.mock("@react-navigation/native", () => {
  const React = require("react");
  return {
    useFocusEffect: (callback: () => void | (() => void)) =>
      React.useEffect(callback, [callback]),
  };
});

const showError = jest.fn();
const paciente = {
  id: "paciente-1",
  nome_completo: "Maria da Silva",
  cpf: "12345678901",
  data_nascimento: "1990-05-04",
  sexo: "feminino",
  escolaridade_nome: "Analfabeto",
  ultima_avaliacao: null,
};

async function concluirDebounce() {
  await act(async () => {
    jest.advanceTimersByTime(350);
    await Promise.resolve();
  });
}

describe("useBuscaPaciente", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.mocked(useToast).mockReturnValue({ success: showError } as never);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("aguarda 350 ms, normaliza o CPF e expõe o paciente encontrado", async () => {
    jest
      .mocked(PacienteRepository.buscarPorCpfComEscolaridadeEAvaliacao)
      .mockResolvedValue(paciente);
    const { result } = renderHook(() => useBuscaPaciente());

    act(() => result.current.setCpfBusca("123.456.789-01"));
    expect(PacienteRepository.buscarPorCpfComEscolaridadeEAvaliacao).not.toHaveBeenCalled();

    await concluirDebounce();

    expect(PacienteRepository.buscarPorCpfComEscolaridadeEAvaliacao).toHaveBeenCalledWith(
      "12345678901",
    );
    expect(result.current.pacienteEncontrado).toEqual(paciente);
    expect(result.current.pacienteNaoEncontrado).toBe(false);
    expect(result.current.buscandoPaciente).toBe(false);
  });

  it("não consulta um CPF com menos de 11 dígitos", async () => {
    const { result } = renderHook(() => useBuscaPaciente());

    act(() => result.current.setCpfBusca("123.456"));
    await concluirDebounce();

    expect(PacienteRepository.buscarPorCpfComEscolaridadeEAvaliacao).not.toHaveBeenCalled();
    expect(result.current.pacienteEncontrado).toBeNull();
    expect(result.current.pacienteNaoEncontrado).toBe(false);
  });

  it("cancela o debounce anterior quando a busca é alterada antes da consulta", async () => {
    const { result, unmount } = renderHook(() => useBuscaPaciente());

    act(() => result.current.setCpfBusca("12345678901"));
    await act(async () => {
      await Promise.resolve();
    });
    const timersWithSearch = jest.getTimerCount();
    expect(timersWithSearch).toBeGreaterThan(0);
    act(() => result.current.setCpfBusca("123"));
    expect(jest.getTimerCount()).toBe(timersWithSearch - 1);
    await concluirDebounce();

    expect(PacienteRepository.buscarPorCpfComEscolaridadeEAvaliacao).not.toHaveBeenCalled();

    act(() => result.current.setCpfBusca("12345678901"));
    await act(async () => {
      await Promise.resolve();
    });
    const timersBeforeUnmount = jest.getTimerCount();
    unmount();
    expect(jest.getTimerCount()).toBe(timersBeforeUnmount - 1);
  });

  it("indica quando a busca válida não encontra paciente", async () => {
    jest
      .mocked(PacienteRepository.buscarPorCpfComEscolaridadeEAvaliacao)
      .mockResolvedValue(null);
    const { result } = renderHook(() => useBuscaPaciente());

    act(() => result.current.setCpfBusca("12345678901"));
    await concluirDebounce();

    expect(result.current.pacienteEncontrado).toBeNull();
    expect(result.current.pacienteNaoEncontrado).toBe(true);
  });

  it("notifica falhas do repositório e encerra o estado de busca", async () => {
    jest
      .mocked(PacienteRepository.buscarPorCpfComEscolaridadeEAvaliacao)
      .mockRejectedValue(new Error("banco indisponível"));
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const { result } = renderHook(() => useBuscaPaciente());

    act(() => result.current.setCpfBusca("12345678901"));
    await concluirDebounce();

    expect(showError).toHaveBeenCalledWith("Erro ao buscar paciente.");
    expect(result.current.buscandoPaciente).toBe(false);
    logSpy.mockRestore();
  });

  it("limpa o CPF, o paciente encontrado e a mensagem de não encontrado", async () => {
    jest
      .mocked(PacienteRepository.buscarPorCpfComEscolaridadeEAvaliacao)
      .mockResolvedValue(paciente);
    const { result } = renderHook(() => useBuscaPaciente());

    act(() => result.current.setCpfBusca("12345678901"));
    await concluirDebounce();
    act(() => result.current.limparBuscaPaciente());

    expect(result.current.cpfBusca).toBe("");
    expect(result.current.pacienteEncontrado).toBeNull();
    expect(result.current.pacienteNaoEncontrado).toBe(false);
  });
});
