import { renderHook, waitFor } from "@testing-library/react-native";
import { DcntRepository } from "@/database/repositories/DcntRepository";
import { EscolaridadeRepository } from "@/database/repositories/EscolaridadeRepository";
import { useDominios } from "./useDominios";

jest.mock("@/database/repositories/DcntRepository", () => ({
  DcntRepository: { listarTodos: jest.fn() },
}));
jest.mock("@/database/repositories/EscolaridadeRepository", () => ({
  EscolaridadeRepository: { listarTodos: jest.fn() },
}));

describe("useDominios", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("carrega DCNTs e prioriza analfabetismo na lista de escolaridade", async () => {
    const escolaridades = [
      { id: "2", tipo: "Ensino fundamental" },
      { id: "1", tipo: "Analfabeto" },
      { id: "3", tipo: "Ensino médio" },
    ];
    const dcnts = [{ id: "dcnt-1", tipo: "Diabetes" }];
    jest
      .mocked(EscolaridadeRepository.listarTodos)
      .mockResolvedValue(escolaridades as never[]);
    jest
      .mocked(DcntRepository.listarTodos)
      .mockResolvedValue(dcnts as never[]);

    const { result } = renderHook(() => useDominios());

    await waitFor(() => {
      expect(result.current.listaEscolaridade).toEqual([
        escolaridades[1],
        escolaridades[0],
        escolaridades[2],
      ]);
      expect(result.current.listaDCNT).toEqual(dcnts);
    });
    expect(EscolaridadeRepository.listarTodos).toHaveBeenCalledTimes(1);
    expect(DcntRepository.listarTodos).toHaveBeenCalledTimes(1);
  });

  it("mantém as listas vazias quando um repositório falha", async () => {
    jest
      .mocked(EscolaridadeRepository.listarTodos)
      .mockResolvedValue([{ id: "1", tipo: "Analfabeto" }] as never[]);
    jest
      .mocked(DcntRepository.listarTodos)
      .mockRejectedValue(new Error("banco indisponível"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useDominios());

    await waitFor(() => expect(errorSpy).toHaveBeenCalled());
    expect(result.current.listaEscolaridade).toEqual([]);
    expect(result.current.listaDCNT).toEqual([]);
    errorSpy.mockRestore();
  });
});
