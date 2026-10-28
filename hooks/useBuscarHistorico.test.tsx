import { act, renderHook } from "@testing-library/react-native";
import { PacienteRepository } from "@/database/repositories/PacienteRepository";
import { router } from "expo-router";
import { useToast } from "@/hooks/useToast";
import { useBuscaHistorico } from "./useBuscarHistorico";

jest.mock("@/database/repositories/PacienteRepository", () => ({
  PacienteRepository: { buscarPorCpf: jest.fn() },
}));
jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@/hooks/useToast", () => ({ useToast: jest.fn() }));

const toast = { info: jest.fn(), error: jest.fn() };

describe("useBuscaHistorico", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useToast).mockReturnValue(toast as never);
  });

  it("valida o CPF antes de consultar o repositório", async () => {
    const { result } = renderHook(() => useBuscaHistorico());
    act(() => result.current.setCpfBusca("123-45"));

    await act(async () => {
      await result.current.getBuscarHistorico();
    });

    expect(toast.info).toHaveBeenCalledWith("CPF precisa ter 11 números");
    expect(PacienteRepository.buscarPorCpf).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it("informa quando o CPF não corresponde a um paciente", async () => {
    jest.mocked(PacienteRepository.buscarPorCpf).mockResolvedValue(null);
    const { result } = renderHook(() => useBuscaHistorico());
    act(() => result.current.setCpfBusca("123.456.789-01"));

    await act(async () => {
      await result.current.getBuscarHistorico();
    });

    expect(PacienteRepository.buscarPorCpf).toHaveBeenCalledWith("12345678901");
    expect(toast.error).toHaveBeenCalledWith("Paciente não encontrado");
    expect(router.push).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it("navega ao histórico do paciente encontrado", async () => {
    jest
      .mocked(PacienteRepository.buscarPorCpf)
      .mockResolvedValue({ id: "paciente-1", nome_completo: "Maria", cpf: "12345678901" });
    const { result } = renderHook(() => useBuscaHistorico());
    act(() => result.current.setCpfBusca("12345678901"));

    await act(async () => {
      await result.current.getBuscarHistorico();
    });

    expect(router.push).toHaveBeenCalledWith({
      pathname: "/results/history",
      params: { patientId: "paciente-1" },
    });
    expect(result.current.loading).toBe(false);
  });

  it("mostra erro e encerra o loading quando a consulta lança exceção", async () => {
    jest
      .mocked(PacienteRepository.buscarPorCpf)
      .mockRejectedValue(new Error("banco indisponível"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useBuscaHistorico());
    act(() => result.current.setCpfBusca("12345678901"));

    await act(async () => {
      await result.current.getBuscarHistorico();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Ocorreu um erro ao buscar o histórico",
    );
    expect(result.current.loading).toBe(false);
    errorSpy.mockRestore();
  });
});
