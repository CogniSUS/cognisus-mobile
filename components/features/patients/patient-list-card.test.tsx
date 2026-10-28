import { fireEvent, render } from "@testing-library/react-native";
import { PatientListCard, type PatientListItem } from "./patient-list-card";

jest.mock("@expo/vector-icons", () => ({
  Feather: () => null,
  Ionicons: () => null,
}));

const patient: PatientListItem = {
  id: "patient-1",
  nome_completo: "Maria da Silva",
  cpf: "12345678901",
  data_nascimento: "2000-06-15",
  sexo: "feminino",
  ultima_avaliacao: "2025-06-14",
  ultima_unidade: "UBS Central",
};

describe("PatientListCard", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2025-06-15T12:00:00"));
  });

  afterEach(() => jest.useRealTimers());

  it("formata dados do paciente, última avaliação e encaminha ações", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const onPress = jest.fn();
    const { getByText, getByLabelText } = render(
      <PatientListCard
        patient={patient}
        onEdit={onEdit}
        onDelete={onDelete}
        onPress={onPress}
      />,
    );

    expect(getByText("Maria da Silva")).toBeTruthy();
    expect(getByText("CPF: 123.456.789-01")).toBeTruthy();
    expect(getByText("25 anos • Feminino")).toBeTruthy();
    expect(getByText("UBS Central")).toBeTruthy();
    expect(getByText("Último teste: 14/06/2025")).toBeTruthy();

    fireEvent.press(getByLabelText("Editar paciente Maria da Silva"), {
      stopPropagation: jest.fn(),
    });
    fireEvent.press(getByLabelText("Excluir paciente Maria da Silva"), {
      stopPropagation: jest.fn(),
    });
    expect(onEdit).toHaveBeenCalledWith(patient);
    expect(onDelete).toHaveBeenCalledWith(patient);

    fireEvent.press(getByText("Maria da Silva"));
    expect(onPress).toHaveBeenCalledWith(patient);
  });

  it.each([
    ["masculino", "Masculino"],
    ["feminino", "Feminino"],
    ["outro", "Outro"],
  ] as const)("apresenta sexo %s como %s", (sexo, label) => {
    const { getByText } = render(
      <PatientListCard
        patient={{ ...patient, sexo }}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(getByText(`25 anos • ${label}`)).toBeTruthy();
  });

  it("preserva CPF inválido e não exibe campos de avaliação ausentes ou inválidos", () => {
    const { getByText, queryByText } = render(
      <PatientListCard
        patient={{
          ...patient,
          cpf: "CPF incompleto",
          ultima_avaliacao: "data inválida",
          ultima_unidade: null,
        }}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(getByText("CPF: CPF incompleto")).toBeTruthy();
    expect(queryByText(/Último teste:/)).toBeNull();
    expect(queryByText("UBS Central")).toBeNull();
  });

  it("não exibe a data ausente e formata datas com horário", () => {
    const { getByText, queryByText, rerender } = render(
      <PatientListCard
        patient={{ ...patient, ultima_avaliacao: null, ultima_unidade: null }}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(queryByText(/Último teste:/)).toBeNull();
    rerender(
      <PatientListCard
        patient={{
          ...patient,
          ultima_avaliacao: "2025-06-14T12:00:00.000Z",
          ultima_unidade: null,
        }}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );
    expect(getByText("Último teste: 14/06/2025")).toBeTruthy();
  });
});
