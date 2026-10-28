import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { Screen } from "./screen";

describe("Screen", () => {
  it("renderiza o conteúdo recebido", () => {
    const { getByText } = render(
      <Screen>
        <Text>Conteúdo da tela</Text>
      </Screen>,
    );

    expect(getByText("Conteúdo da tela")).toBeTruthy();
  });
});
