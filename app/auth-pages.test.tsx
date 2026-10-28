import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import SignInPage from "./(auth)/sign-in";
import SignUpPage from "./(auth)/sign-up";

jest.mock("@/assets/images/file.jpg", () => "test-logo.png");
jest.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }: { name: string }) => {
    const { Text } = require("react-native");
    return <Text>{name}</Text>;
  },
}));
jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
}));
jest.mock("@/hooks/useToast", () => ({ useToast: jest.fn() }));
jest.mock("@/utils/supabase", () => ({
  supabase: { auth: { signInWithPassword: jest.fn(), signUp: jest.fn() } },
}));

describe("SignInPage", () => {
  const showError = jest.fn();
  const showInfo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useToast).mockReturnValue({
      error: showError,
      info: showInfo,
    } as never);
  });

  it("exibe o formulário, valida campos vazios e abre o cadastro", () => {
    const { getByText, getByPlaceholderText } = render(<SignInPage />);

    expect(getByPlaceholderText("E-mail ou usuário")).toBeTruthy();
    expect(getByPlaceholderText("Senha").props.secureTextEntry).toBe(true);
    fireEvent.press(getByText("Entrar"));
    expect(showInfo).toHaveBeenCalledWith("Informe os campos obrigatórios!");

    fireEvent.press(getByText("Cadastrar novo usuário"));
    expect(router.push).toHaveBeenCalledWith("/sign-up");
  });

  it("normaliza credenciais e mapeia erro de autenticação conhecido", async () => {
    jest.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      error: { message: "Invalid login credentials" },
    } as never);
    const { getByText, getByPlaceholderText } = render(<SignInPage />);

    fireEvent.changeText(getByPlaceholderText("E-mail ou usuário"), "  ANA@EXAMPLE.COM ");
    fireEvent.changeText(getByPlaceholderText("Senha"), " senha segura ");
    fireEvent.press(getByText("Entrar"));

    await waitFor(() =>
      expect(showError).toHaveBeenCalledWith("Email ou senha incorretos."),
    );
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "ana@example.com",
      password: "senha segura",
    });
    expect(getByText("Entrar")).toBeTruthy();
  });

  it("apresenta erros remotos inesperados e alterna a visibilidade da senha", async () => {
    jest.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      error: { message: "Serviço temporariamente indisponível" },
    } as never);
    const { getByText, getByPlaceholderText } = render(<SignInPage />);

    fireEvent.press(getByText("eye-outline"));
    expect(getByPlaceholderText("Senha").props.secureTextEntry).toBe(false);
    fireEvent.press(getByText("eye-off-outline"));
    expect(getByPlaceholderText("Senha").props.secureTextEntry).toBe(true);
    fireEvent.changeText(getByPlaceholderText("E-mail ou usuário"), "ana@example.com");
    fireEvent.changeText(getByPlaceholderText("Senha"), "senha123");
    fireEvent.press(getByText("Entrar"));

    await waitFor(() =>
      expect(showError).toHaveBeenCalledWith("Serviço temporariamente indisponível"),
    );
  });

  it("mostra erro de conexão se o cliente lançar uma exceção", async () => {
    jest.mocked(supabase.auth.signInWithPassword).mockRejectedValue(
      new Error("sem rede"),
    );
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const { getByText, getByPlaceholderText } = render(<SignInPage />);
    fireEvent.changeText(getByPlaceholderText("E-mail ou usuário"), "ana@example.com");
    fireEvent.changeText(getByPlaceholderText("Senha"), "senha123");
    fireEvent.press(getByText("Entrar"));

    await waitFor(() =>
      expect(showError).toHaveBeenCalledWith("Erro ao conectar ao servidor."),
    );
    expect(logSpy).toHaveBeenCalled();
    expect(getByText("Entrar")).toBeTruthy();
    logSpy.mockRestore();
  });

  it("aceita o retorno sem erro do serviço de autenticação", async () => {
    jest.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      error: null,
    } as never);
    const screen = render(<SignInPage />);
    fireEvent.changeText(screen.getByPlaceholderText("E-mail ou usuário"), "ana@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("Senha"), "senha123");
    fireEvent.press(screen.getByText("Entrar"));

    await waitFor(() =>
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledTimes(1),
    );
    expect(showError).not.toHaveBeenCalled();
    expect(showInfo).not.toHaveBeenCalled();
  });
});

describe("SignUpPage", () => {
  const showSuccess = jest.fn();
  const showError = jest.fn();
  const showInfo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useToast).mockReturnValue({
      success: showSuccess,
      error: showError,
      info: showInfo,
    } as never);
  });

  function fillForm(
    screen: ReturnType<typeof render>,
    values: Partial<Record<"Nome Completo" | "CPF" | "E-mail" | "Senha" | "Confirmar Senha", string>> = {},
  ) {
    fireEvent.changeText(screen.getByPlaceholderText("Nome Completo"), values["Nome Completo"] ?? "Ana Souza");
    fireEvent.changeText(screen.getByPlaceholderText("CPF"), values.CPF ?? "12345678901");
    fireEvent.changeText(screen.getByPlaceholderText("E-mail"), values["E-mail"] ?? "ana@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("Senha"), values.Senha ?? "senha123");
    fireEvent.changeText(screen.getByPlaceholderText("Confirmar Senha"), values["Confirmar Senha"] ?? "senha123");
  }

  it("valida campos obrigatórios, formato de e-mail e CPF", () => {
    const screen = render(<SignUpPage />);
    fireEvent.press(screen.getByText("Criar Conta"));
    expect(showInfo).toHaveBeenCalledWith("Informe os campos obrigatórios!");

    fillForm(screen, { "E-mail": "email-invalido" });
    fireEvent.press(screen.getByText("Criar Conta"));
    expect(showError).toHaveBeenLastCalledWith("Email inválido");

    fillForm(screen, { CPF: "123" });
    fireEvent.press(screen.getByText("Criar Conta"));
    expect(showError).toHaveBeenLastCalledWith("CPF deve conter exatamente 11 dígitos");
  });

  it("valida tamanho e confirmação da senha e permite voltar ao login", () => {
    const screen = render(<SignUpPage />);

    fillForm(screen, { Senha: "123", "Confirmar Senha": "123" });
    fireEvent.press(screen.getByText("Criar Conta"));
    expect(showError).toHaveBeenLastCalledWith("Senha deve ter pelo menos 6 caracteres");

    fillForm(screen, { "Confirmar Senha": "outra123" });
    fireEvent.press(screen.getByText("Criar Conta"));
    expect(showError).toHaveBeenLastCalledWith("Senha e confirmar senha estão diferentes");

    fireEvent.press(screen.getByText("Já tenho conta • Fazer Login"));
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it("normaliza dados, confirma cadastro e navega ao app", async () => {
    jest.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    } as never);
    const screen = render(<SignUpPage />);
    fillForm(screen, {
      "Nome Completo": " Ana Souza ",
      CPF: "12345678901",
      "E-mail": " ANA@EXAMPLE.COM ",
    });
    fireEvent.press(screen.getByText("Criar Conta"));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/(app)"));
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: "ana@example.com",
      password: "senha123",
      options: { data: { nome_completo: "Ana Souza", cpf: "12345678901" } },
    });
    expect(showSuccess).toHaveBeenCalledWith("Cadastro realizado com sucesso!");
    expect(showInfo).toHaveBeenCalledWith("Verifique seu e-mail para confirmar a conta.");
    expect(screen.getByText("Criar Conta")).toBeTruthy();
  });

  it("apresenta erros do serviço, ausência de ID e falha inesperada", async () => {
    const screen = render(<SignUpPage />);
    jest.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: null },
      error: { message: "E-mail já cadastrado" },
    } as never);
    fillForm(screen);
    fireEvent.press(screen.getByText("Criar Conta"));
    await waitFor(() => expect(showError).toHaveBeenCalledWith("E-mail já cadastrado"));

    jest.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: { id: "" } },
      error: null,
    } as never);
    fireEvent.press(screen.getByText("Criar Conta"));
    await waitFor(() =>
      expect(showError).toHaveBeenCalledWith("Não foi possível obter o ID do usuário"),
    );

    jest.mocked(supabase.auth.signUp).mockRejectedValue(new Error("offline"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    fireEvent.press(screen.getByText("Criar Conta"));
    await waitFor(() =>
      expect(showError).toHaveBeenCalledWith("Ocorreu um erro ao realizar o cadastro."),
    );
    expect(errorSpy).toHaveBeenCalled();
    expect(screen.getByText("Criar Conta")).toBeTruthy();
    errorSpy.mockRestore();
  });

  it("alterna a visibilidade simultânea das senhas", () => {
    const screen = render(<SignUpPage />);
    const password = screen.getByPlaceholderText("Senha");
    const confirmation = screen.getByPlaceholderText("Confirmar Senha");
    expect(password.props.secureTextEntry).toBe(true);
    expect(confirmation.props.secureTextEntry).toBe(true);

    fireEvent.press(screen.getAllByText("eye-outline")[0]);
    expect(screen.getByPlaceholderText("Senha").props.secureTextEntry).toBe(false);
    expect(screen.getByPlaceholderText("Confirmar Senha").props.secureTextEntry).toBe(false);
    fireEvent.press(screen.getAllByText("eye-off-outline")[1]);
    expect(screen.getByPlaceholderText("Senha").props.secureTextEntry).toBe(true);
    expect(screen.getByPlaceholderText("Confirmar Senha").props.secureTextEntry).toBe(true);
  });

  it("não mostra confirmação nem navega se a API não retornar usuário", async () => {
    jest.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: null },
      error: null,
    } as never);
    const screen = render(<SignUpPage />);
    fillForm(screen);
    fireEvent.press(screen.getByText("Criar Conta"));

    await waitFor(() => expect(supabase.auth.signUp).toHaveBeenCalledTimes(1));
    expect(showSuccess).not.toHaveBeenCalled();
    expect(showError).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
