# Cognisus Mobile

Aplicativo mobile de triagem cognitiva desenvolvido com React Native, Expo e TypeScript. É utilizado por profissionais da saúde para cadastrar pacientes, aplicar avaliações cognitivas e consultar resultados, inclusive sem conexão com a internet.

## Tecnologias utilizadas

- Expo SDK 54 e React Native 0.81
- React 19 e TypeScript 5.9
- Expo Router 6 para navegação
- WatermelonDB e Expo SQLite para persistência local
- Supabase para serviços remotos e sincronização
- Expo Dev Client e EAS Build para desenvolvimento e distribuição de builds
- Zod para validação
- ESLint e Prettier

## Objetivo do projeto

O aplicativo oferece cadastro e gerenciamento de pacientes, aplicação de testes cognitivos, consulta de resultados, funcionamento offline e sincronização com serviços remotos quando há conexão.

## Pré-requisitos

Antes de começar, é necessário ter instalado na máquina:

- Node.js e npm
- Git
- Uma conta Expo com acesso ao projeto e ao EAS
- Um dispositivo Android para instalar os builds de distribuição interna
- Android Studio/Android SDK para executar no emulador Android (opcional)

O Expo Go não é utilizado neste projeto: algumas dependências nativas precisam estar incluídas no aplicativo. Para testar em um dispositivo, instale um build EAS de desenvolvimento ou de preview.

## Estrutura do projeto

```text
app/
  _layout.tsx             # Layout raiz
  (app)/                  # Área autenticada: pacientes, testes, resultados e informações
  (auth)/                 # Telas de autenticação
assets/                   # Imagens e recursos estáticos
components/
  examples/               # Componentes de exemplo
  features/               # Componentes organizados por funcionalidade
  forms/                  # Formulários
  layout/                 # Cabeçalho e menus
  patients/                # Componentes de pacientes
  results/                 # Componentes de resultados
  screening/               # Componentes de triagem
  screens/                 # Componentes de telas
  ui/                      # Componentes de interface reutilizáveis
constants/                # Constantes e definições dos instrumentos
database/
  database.ts              # Configuração do banco local
  schema.ts                # Schema do banco local
  models/                 # Modelos locais
  repositories/           # Acesso e operações sobre os dados locais
hooks/                    # Hooks de domínio e de interface
providers/                # Contextos de autenticação, proteção de teste e notificações
services/
  api/                     # Cliente e serviços de API
  auth/                    # Autenticação
  database/                # Serviços relacionados ao banco local
  hooks/                   # Hooks de serviços
  meem/                    # Regras e serviços do teste MEEM
  reports/                 # Geração de relatórios
  supabase/                # Integração com Supabase
  sync/                    # Sincronização de dados
types/                    # Tipos compartilhados
utils/                    # Formatação, datas, cálculos e templates
```

As rotas usam grupos do Expo Router: `(auth)` para autenticação e `(app)` para a área autenticada. Componentes específicos de funcionalidades ficam em `components/features/`; componentes compartilhados ficam nas demais pastas de `components/`.

## Instalação

Na raiz do repositório:

```sh
git clone https://github.com/CogniSUS/cognisus-mobile.git
cd cognisus-mobile
npm install
```

Após atualizar o repositório, execute `git pull` e `npm install` se as dependências tiverem mudado.

## Testar em dispositivo Android

Os perfis `development` e `preview` estão configurados em `eas.json` e usam distribuição interna. É necessário gerar e instalar um build no dispositivo antes de testar; iniciar o projeto com Expo Go não é suficiente.

### Build de desenvolvimento

Use este perfil para desenvolver com o servidor Metro e receber atualizações durante a sessão:

```sh
npx eas-cli build --profile development --platform android
```

Quando o build terminar, abra no Android o link de instalação fornecido pelo EAS. Com o app de desenvolvimento instalado, inicie o Metro:

```sh
npx expo start --dev-client
```

Abra o app de desenvolvimento no celular e conecte-o ao servidor pelo QR Code. O computador e o celular precisam estar acessíveis na mesma rede. Se a rede local bloquear a conexão, inicie o Metro com `npx expo start --dev-client --tunnel`.

Gere um novo build de desenvolvimento quando forem adicionadas ou alteradas dependências nativas ou configurações que exijam recompilação do app.

### Build de preview

Use o perfil de preview para instalar uma versão de teste independente, sem servidor Metro:

```sh
npx eas-cli build --profile preview --platform android
```

O perfil `preview` gera um APK para distribuição interna. Ao finalizar, abra o link do EAS no Android e instale o APK. Para testar uma nova versão, gere outro build e instale o APK atualizado.

### Emulador Android (opcional)

Com Android Studio e um emulador iniciado, o build de desenvolvimento pode ser aberto no emulador. Para limpar o cache do Metro durante o desenvolvimento:

```sh
npx expo start --dev-client --clear
```

## Boas práticas para desenvolvimento

- Testar no dispositivo após mudanças importantes, usando um build que inclua as dependências nativas atuais
- Manter commits pequenos e com mensagens claras
- Avisar o time quando adicionar novas dependências
- Evitar misturar refatoração com implementação nova no mesmo commit

## Regras de commits

```bash
feat/feature: adicionar nova implementação no projeto
fix: corrigir algo existente
refactor: reorganiza estrutura de componentes
```

## Observação

Este repositório é privado e destinado apenas à equipe do projeto.
