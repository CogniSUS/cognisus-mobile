# Cognisus Mobile

Aplicativo mobile de triagem cognitiva desenvolvido com React Native, Expo e TypeScript.

O app será utilizado por profissionais da saúde para aplicar testes cognitivos em pacientes, com suporte a funcionamento offline e sincronização de dados com servidor quando houver conexão.

## Tecnologias utilizadas

- React Native
- Expo
- TypeScript
- Expo Router
- SQLite local
- Zod
- ESLint
- Prettier

## Objetivo do projeto

Este projeto tem como objetivo construir um aplicativo de triagem cognitiva com foco em:

- cadastro e gerenciamento de pacientes
- aplicação de testes cognitivos
- funcionamento offline
- armazenamento local temporário
- sincronização com banco de dados remoto

## Requisitos para rodar o projeto

Antes de começar, é necessário ter instalado na máquina:

- Node.js
- npm
- Git
- Expo Go no celular Android

## Estrutura atual do projeto

```text
app/
  _layout.tsx
  index.tsx
  patients/
  tests/

assets/
components/
constants/
hooks/
services/
```

## Convenções iniciais do projeto

- As rotas do app ficam dentro da pasta `app/`
- Cada tela deve ter responsabilidade clara e simples
- A lógica de negócio não deve ficar toda misturada dentro das telas
- O projeto será evoluído para uma estrutura mais modular conforme as features forem sendo implementadas
- O banco local será usado para funcionamento offline
- A sincronização com servidor será implementada em camada separada

## Fluxo recomendado para o time

### Ao baixar o projeto pela primeira vez

```bash
git clone https://github.com/CogniSUS/cognisus-mobile.git
npm install
`npx expo start` ou `npm run start`
```

### Ao pegar atualizações do repositório

```bash
git pull
npm install
`npx expo start` ou `npm run start`
```

Após executar o comando, o Expo abrirá o servidor de desenvolvimento e exibirá um QR Code no terminal.

## Como testar no celular com Expo Go

1. Instale o aplicativo **Expo Go** no celular pela Play Store.
2. Certifique-se de que:
   - o computador e o celular estão na mesma rede Wi‑Fi
   - o projeto está rodando com `npx expo start`
3. Abra o Expo Go no celular.
4. Escaneie o QR Code exibido no terminal.

Se tudo estiver certo, o app abrirá no celular.

## Observações importantes para testes

- O projeto deve ser iniciado sempre pela raiz da pasta.
- Sempre rode `npm install` antes de iniciar, caso tenha acabado de clonar.
- Quando houver mudança nas dependências, todos devem rodar `npm install` novamente.
- Se ocorrer algum problema estranho de cache, tente:

```bash
npx expo start --clear
```

## Boas práticas para desenvolvimento

- Sempre testar no celular após mudanças importantes
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
