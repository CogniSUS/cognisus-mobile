import { fireEvent, render } from "@testing-library/react-native";
import { AboutCard } from "./about-card";
import { EducationalCard } from "./educational-card";
import { InformationActionCard } from "./information-action-card";
import { SupportCard } from "./support-card";

jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));

const educationalProps = {
  icon: "school" as never,
  title: "Orientações",
  items: ["Hidratação adequada", "Procure atendimento"],
  backgroundColor: "#fff",
  borderColor: "#eee",
  iconBackgroundColor: "#ddd",
  textColor: "#333",
};

describe("cartões informativos", () => {
  it("exibe as informações institucionais e contatos de suporte", () => {
    const { getByText } = render(
      <>
        <AboutCard />
        <SupportCard />
      </>,
    );

    expect(getByText("Sobre o COGNISUS")).toBeTruthy();
    expect(getByText("Versão 1.0.0")).toBeTruthy();
    expect(getByText("(91) 3201-0000")).toBeTruthy();
    expect(getByText("suporte@cognisus.com.br")).toBeTruthy();
  });

  it.each([
    ["bullet", "•"],
    ["check", "✓"],
  ] as const)("renderiza itens com marcador %s e prefixo em negrito", (marker, glyph) => {
    const { getByText, getAllByText } = render(
      <EducationalCard
        {...educationalProps}
        marker={marker}
        boldPrefixes={["Hidratação"]}
      />,
    );

    expect(getAllByText(glyph)).toHaveLength(2);
    expect(getByText("Hidratação adequada")).toBeTruthy();
    expect(getByText("Procure atendimento")).toBeTruthy();
  });

  it("renderiza o marcador de alerta", () => {
    const { getByText } = render(
      <EducationalCard {...educationalProps} marker="warning" />,
    );

    expect(getByText("Orientações")).toBeTruthy();
    expect(getByText("Hidratação adequada")).toBeTruthy();
  });

  it("chama a ação opcional do cartão quando pressionado", () => {
    const onPress = jest.fn();
    const { getByRole, rerender } = render(
      <InformationActionCard
        icon="help-circle"
        title="Ajuda"
        subtitle="Orientações de uso"
        iconColor="#000"
        iconBackground="#fff"
        onPress={onPress}
      />,
    );

    fireEvent.press(getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);

    rerender(
      <InformationActionCard
        icon="help-circle"
        title="Ajuda"
        subtitle="Orientações de uso"
        iconColor="#000"
        iconBackground="#fff"
      />,
    );
    fireEvent.press(getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
