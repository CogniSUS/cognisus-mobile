import { fireEvent, render } from "@testing-library/react-native";
import { CustomSelect } from "./CustomSelect";

jest.mock("@expo/vector-icons", () => ({
  Feather: ({ name }: { name: string }) => {
    const { Text: NativeText } = require("react-native");
    return <NativeText>{name}</NativeText>;
  },
  Ionicons: () => null,
}));

describe("CustomSelect", () => {
  const options = [
    { label: "Belém", value: 1 },
    { label: "Ananindeua", value: 2 },
  ];

  it("exibe o placeholder, abre a lista e entrega a opção selecionada", () => {
    const onValueChange = jest.fn();
    const { getByText, getAllByText, queryByText } = render(
      <CustomSelect
        placeholder="Selecione a unidade"
        value={null}
        options={options}
        onValueChange={onValueChange}
      />,
    );

    expect(queryByText("Belém")).toBeNull();
    fireEvent.press(getByText("Selecione a unidade"));
    expect(getAllByText("Selecione a unidade")).toHaveLength(2);
    fireEvent.press(getAllByText("Belém").at(-1)!);

    expect(onValueChange).toHaveBeenCalledWith(1);
    expect(queryByText("Ananindeua")).toBeNull();
  });

  it("mostra rótulo, título customizado e permite fechar o modal", () => {
    const { getByText, getAllByText, queryByText } = render(
      <CustomSelect
        placeholder="Escolha"
        value={2}
        options={options}
        onValueChange={() => {}}
        modalTitle="Unidade de saúde"
      />,
    );

    expect(getByText("Ananindeua")).toBeTruthy();
    fireEvent.press(getAllByText("Ananindeua").at(-1)!);
    expect(getByText("Unidade de saúde")).toBeTruthy();
    fireEvent.press(getByText("x"));
    expect(queryByText("Unidade de saúde")).toBeNull();
  });
});
