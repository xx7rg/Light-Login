<div align="center">

<img src="public/x7rg-enterprise-emblem.png" alt="Logo oficial x7rG Enterprise" width="140" />

# LIGHT — Login Experience

Uma experiência de login imersiva em que a luz deixa de ser apenas estética e
passa a controlar a interface.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-Responsivo-663399?style=for-the-badge&logo=css&logoColor=white)
![Web Audio API](https://img.shields.io/badge/Web_Audio-API-D9485F?style=for-the-badge&logo=webauthn&logoColor=white)

**[Ver experiência publicada](https://light-login-x7rg.contato-rgsantos.workers.dev)**

</div>

![Apresentação do LIGHT Login Experience](public/og-v3.png)

## Sobre o projeto

O **LIGHT** é um conceito de interface que transforma uma tela de login em uma
pequena experiência sensorial. O usuário acende ou apaga o abajur pelo cordão e
a iluminação da cena responde junto com o formulário, as sombras, os movimentos
e os sons.

O projeto foi criado como uma demonstração de front-end e design de interação.
Ele não depende de backend para funcionar e pode ser publicado como site
estático no GitHub Pages.

> O formulário é demonstrativo: nenhum e-mail ou senha é enviado ou armazenado.

## Apresentação visual

<table>
  <tr>
    <td width="50%" align="center">
      <img src="public/og.png" alt="Conceito minimalista da interface LIGHT" />
      <br />
      <sub><strong>Interface minimalista</strong> — foco na luz, no formulário e no contraste.</sub>
    </td>
    <td width="50%" align="center">
      <img src="public/og-v2.png" alt="Variação visual do LIGHT Login Experience" />
      <br />
      <sub><strong>Direção visual</strong> — acabamento premium em tons de preto, bronze e dourado.</sub>
    </td>
  </tr>
</table>

![Cena-base do abajur utilizada na experiência](public/lamp-scene-v2.png)

<p align="center">
  <sub><strong>Cena-base</strong> — composição preparada para receber formulário, cordão interativo, estados de luz e efeitos.</sub>
</p>

## Principais recursos

- Abajur interativo com estados de luz ligada e desligada.
- Cordão controlado por clique, toque, arraste ou teclado.
- Movimento pendular com ângulo e comprimento calculados em tempo real.
- Transições de brilho, saturação, sombra e visibilidade sincronizadas.
- Sons sintetizados no navegador, sem depender de arquivos de áudio externos.
- Resposta sonora diferente para cordão, interruptor, sucesso e erro.
- Formulário com validação nativa de e-mail e senha mínima.
- Confirmação visual e sonora após o envio demonstrativo.
- Layout adaptável para desktop, tablet e celular.
- Navegação por teclado e suporte à preferência de movimento reduzido.
- Metadados Open Graph e Twitter Card para compartilhamento.
- Exportação estática e publicação automática pelo GitHub Actions.

## Tecnologias utilizadas

| Tecnologia | Aplicação no projeto |
| --- | --- |
| **Next.js 16** | Estrutura da aplicação, metadados, otimização e exportação estática. |
| **React 19** | Componentes, estados da luz, interação do cordão e resposta do formulário. |
| **TypeScript 5** | Tipagem dos eventos, referências, estilos dinâmicos e regras de interação. |
| **CSS responsivo** | Iluminação, glassmorphism, animações, cordão, formulário e adaptação de orientação. |
| **Tailwind CSS 4 / PostCSS** | Pipeline moderno de processamento e geração dos estilos. |
| **Web Audio API** | Síntese dos efeitos sonoros diretamente no navegador. |
| **GitHub Actions** | Build automatizado e entrega do conteúdo estático. |
| **GitHub Pages** | Hospedagem gratuita da versão de produção. |

## Como a experiência funciona

1. A página inicia com a cena iluminada e o formulário disponível.
2. O usuário toca, clica ou arrasta o cordão do abajur.
3. O React atualiza o estado da luz e as variáveis CSS do pêndulo.
4. O CSS sincroniza imagem, sombra, formulário e animação.
5. A Web Audio API cria o som adequado para cada ação.
6. Ao enviar campos válidos, a interface apresenta uma confirmação local.

## Responsividade e acessibilidade

A composição mantém a proporção cinematográfica em telas horizontais. Em telas
verticais, uma media query reposiciona a cena, amplia a arte e move o formulário
para uma área confortável de leitura, evitando deformação do abajur.

O controle do cordão possui nome acessível, estado `aria-pressed`, foco visível e
suporte a teclado. Campos têm rótulos para leitores de tela, mensagens usam
`role="status"` e animações são praticamente desativadas quando o dispositivo
está configurado com `prefers-reduced-motion`.

## Executar localmente

### Requisitos

- Node.js 22.13 ou superior.
- npm 10 ou superior.

### Instalação

```bash
git clone https://github.com/xx7rg/LIGHT-Login-Experience.git
cd LIGHT-Login-Experience
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Comandos disponíveis

| Comando | Função |
| --- | --- |
| `npm run dev` | Inicia o ambiente local de desenvolvimento. |
| `npm run lint` | Verifica padrões de código, React e acessibilidade. |
| `npm run build` | Valida TypeScript e gera a versão estática em `out/`. |
| `npm run start` | Inicia o servidor Next.js quando aplicável. |

## Estrutura do projeto

```text
LIGHT-Login-Experience/
├── .github/workflows/       # Publicação automática no GitHub Pages
├── app/
│   ├── globals.css          # Visual, animações e responsividade
│   ├── layout.tsx           # Metadados sociais e estrutura HTML
│   └── page.tsx             # Interface, estados, eventos e áudio
├── docs/                    # Documentação técnica e apresentação
├── public/                  # Cena, imagens sociais e favicon
├── next.config.ts           # Exportação estática e basePath
├── package.json             # Dependências e comandos
└── tsconfig.json            # Configuração TypeScript
```

## Publicação

O workflow em `.github/workflows/deploy-pages.yml` executa automaticamente:

1. instalação limpa com `npm ci`;
2. build de produção com o caminho correto do repositório;
3. envio da pasta `out/`;
4. publicação no GitHub Pages.

No GitHub, configure **Settings → Pages → Source** como **GitHub Actions**. Cada
push na branch `main` publicará uma nova versão.

## Documentação

- [Documentação técnica](docs/DOCUMENTACAO_TECNICA.md)
- [Descrição e apresentação para o GitHub](docs/APRESENTACAO_GITHUB.md)

## Limites desta versão

Esta versão valida e simula o envio somente no navegador. Para uso real, ainda
seria necessário integrar um serviço de autenticação, criar tratamento seguro
de sessão, definir recuperação de senha e proteger as rotas privadas.

---

<p align="center">
  <strong>LIGHT — luz, movimento e som aplicados a uma experiência de acesso.</strong><br />
  Desenvolvido por <strong>x7rG ENTERPRISE™</strong>.
</p>

---

<div align="center">

**© 2026 x7rG ENTERPRISE™** — Todos os direitos reservados.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rgds)
&nbsp;
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=flat&logo=instagram&logoColor=white)](https://www.instagram.com/_7ragnar/)

</div>
