import { renderHook, waitFor } from "@testing-library/react-native";
import { PacienteRepository } from "@/database/repositories/PacienteRepository";
import { usePacienteInformation } from "./usePacienteInformation";

jest.mock("@/database/repositories/PacienteRepository", () => ({
  PacienteRepository: { buscarPorIdComDetalhes: jest.fn() },
}));

describe("usePacienteInformation", () => {
  beforeEach(() => jest.clearAllMocks());

  it("não busca o paciente quando o ID é nulo", async () => {
    const { result } = renderHook(() => usePacienteInformation(null));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.paciente).toBeNull();
    expect(PacienteRepository.buscarPorIdComDetalhes).not.toHaveBeenCalled();
  });

  it("carrega os detalhes do paciente", async () => {
    const paciente = {
      id: "paciente-1",
      nome_completo: "Maria da Silva",
      cpf: "12345678901",
      data_nascimento: "1990-05-04",
      sexo: "feminino",
      escolaridade_nome: "Analfabeto",
      dcnts: "Diabetes",
      ultima_avaliacao: null,
    };
    jest
      .mocked(PacienteRepository.buscarPorIdComDetalhes)
      .mockResolvedValue(paciente);

    const { result } = renderHook(() => usePacienteInformation("paciente-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.paciente).toEqual(paciente);
    expect(PacienteRepository.buscarPorIdComDetalhes).toHaveBeenCalledWith(
      "paciente-1",
    );
  });

  it("mantém a ficha vazia e encerra o loading quando o repositório falha", async () => {
    jest
      .mocked(PacienteRepository.buscarPorIdComDetalhes)
      .mockRejectedValue(new Error("banco indisponível"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => usePacienteInformation("paciente-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.paciente).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
