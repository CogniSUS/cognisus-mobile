import { fireEvent, render } from "@testing-library/react-native";
import ModalExcluirPaciente from "./delete-patient-modal";

jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));

describe("ModalExcluirPaciente", () => {
  it("mostra o paciente e encaminha confirmação e cancelamento", () => {
    const onConfirmar = jest.fn();
    const onCancelar = jest.fn();
    const { getByText } = render(
      <ModalExcluirPaciente
        visible
        nomePaciente="Maria da Silva"
        onConfirmar={onConfirmar}
        onCancelar={onCancelar}
      />,
    );

    expect(getByText("Excluir paciente?")).toBeTruthy();
    expect(getByText(/Maria da Silva/)).toBeTruthy();
    fireEvent.press(getByText("Sim, excluir paciente"));
    fireEvent.press(getByText("Cancelar"));

    expect(onConfirmar).toHaveBeenCalledTimes(1);
    expect(onCancelar).toHaveBeenCalledTimes(1);
  });

  it("não mostra os controles quando está oculto", () => {
    const { queryByText } = render(
      <ModalExcluirPaciente
        visible={false}
        nomePaciente="Maria"
        onConfirmar={() => {}}
        onCancelar={() => {}}
      />,
    );

    expect(queryByText("Excluir paciente?")).toBeNull();
  });
});
