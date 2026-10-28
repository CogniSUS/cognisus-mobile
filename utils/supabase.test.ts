const storage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

function loadSupabase(platform: "web" | "ios") {
  jest.resetModules();
  const createClient = jest.fn((..._args: any[]) => ({ auth: { mock: true } }));
  jest.doMock("@supabase/supabase-js", () => ({ createClient }));
  jest.doMock("@react-native-async-storage/async-storage", () => ({
    __esModule: true,
    default: storage,
  }));
  jest.doMock("react-native", () => ({
    Platform: { OS: platform },
  }));
  jest.doMock("react-native-url-polyfill/auto", () => ({}));

  const hasWindow = Object.prototype.hasOwnProperty.call(globalThis, "window");
  const previousWindow = (globalThis as { window?: unknown }).window;
  if (platform === "web") {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      writable: true,
      value: undefined,
    });
  }
  const module = require("./supabase") as typeof import("./supabase");
  if (platform === "web") {
    if (hasWindow) {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        writable: true,
        value: previousWindow,
      });
    } else {
      delete (globalThis as { window?: unknown }).window;
    }
  }
  return { module, createClient };
}

describe("cliente Supabase", () => {
  const originalEnvironment = {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL,
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    publishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };

  beforeEach(() => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key";
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (originalEnvironment.url === undefined) {
      delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    } else {
      process.env.EXPO_PUBLIC_SUPABASE_URL = originalEnvironment.url;
    }
    if (originalEnvironment.anonKey === undefined) {
      delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    } else {
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = originalEnvironment.anonKey;
    }
    if (originalEnvironment.publishableKey === undefined) {
      delete process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    } else {
      process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY =
        originalEnvironment.publishableKey;
    }
    jest.dontMock("@supabase/supabase-js");
    jest.dontMock("@react-native-async-storage/async-storage");
    jest.dontMock("react-native");
    jest.dontMock("react-native-url-polyfill/auto");
    jest.resetModules();
  });

  it("usa armazenamento em memória no SSR web e configura autenticação persistente", () => {
    const { module, createClient } = loadSupabase("web");

    expect(createClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "publishable-key",
      expect.objectContaining({
        auth: expect.objectContaining({
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
          storage: expect.objectContaining({
            getItem: expect.any(Function),
            setItem: expect.any(Function),
            removeItem: expect.any(Function),
          }),
        }),
      }),
    );
    expect(createClient.mock.calls[0]?.[2].auth.storage.getItem()).toBeNull();
    createClient.mock.calls[0]?.[2].auth.storage.setItem("key", "value");
    createClient.mock.calls[0]?.[2].auth.storage.removeItem("key");
    expect(module.supabase).toEqual({ auth: { mock: true } });
  });

  it("reutiliza AsyncStorage no aplicativo nativo", () => {
    const { createClient } = loadSupabase("ios");

    expect(createClient.mock.calls[0]?.[2].auth.storage).toBe(storage);
  });

  it("usa valores vazios como fallback quando as variáveis de ambiente faltam", () => {
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const { createClient } = loadSupabase("ios");

    expect(createClient).toHaveBeenCalledWith(
      "",
      "",
      expect.any(Object),
    );
  });
});
