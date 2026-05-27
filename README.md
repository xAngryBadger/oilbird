# Oilbird

Conversor de Markdown para PDF com tipografia editorial. Escreva em Markdown no navegador, gere PDFs formatados profissionalmente via WeasyPrint -- sem Word, sem LaTeX.

## O que faz?

O Oilbird recebe texto Markdown, converte para HTML com estilos tipograficos e gera um PDF no formato A4 com qualidade editorial. O processo acontece em duas etapas: o frontend oferece um editor ao vivo com preview, e o backend (FastAPI + WeasyPrint) renderiza o documento final. O backend pode ser executado diretamente no Google Colab, exposto via tunnel Cloudflare, eliminando a necessidade de servidor proprio.

## Funcionalidades

- Editor Markdown com preview em tempo real
- Contador de palavras e indicador de codificacao UTF-8
- Conversao Markdown-para-PDF via WeasyPrint (tipografia A4 profissional)
- Suporte a titulos, negrito, blocos de codigo, citacoes e listas
- Backend executavel no Google Colab com tunnel Cloudflare
- Configuracao de URL da API direto no frontend (localStorage)
- Preloader animado e transicoes com Framer Motion
- Deploy automatico do frontend via GitHub Actions + GitHub Pages

## Tecnologias

**Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Framer Motion, Lenis

**Backend:** Python, FastAPI, WeasyPrint, Pydantic, Uvicorn, Cloudflared

## Pre-requisitos

**Frontend:**
- Node.js 22+
- npm

**Backend (local):**
- Python 3.10+
- Dependencias de sistema para WeasyPrint (libpango, libcairo, etc.)

**Backend (Colab -- recomendado):**
- Conta Google
- Navegador moderno

## Instalacao

**Frontend:**

```bash
cd frontend
npm install
```

**Backend (Colab -- metodo recomendado):**

1. Abra `colab-backend.ipynb` no Google Colab
2. Execute as tres celulas em sequencia
3. Copie a URL `trycloudflare.com` exibida na saida

**Backend (local):**

```bash
apt-get install libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 libffi-dev libcairo2
pip install fastapi uvicorn weasyprint pydantic
uvicorn main:app --host 0.0.0.0 --port 8003
```

## Uso

1. Inicie o backend (Colab ou local)
2. Inicie o frontend: `cd frontend && npm run dev`
3. No header do Oilbird, clique em "Sem API" e cole a URL do backend
4. Escreva ou cole seu Markdown no editor
5. Clique em "Gerar PDF" para baixar o documento

O PDF gerado segue o formato A4 com margens de 2.5cm x 2cm, fonte DejaVu Sans, numeracao de paginas e estilos editoriais.

## Comandos

| Comando | Diretorio | Descricao |
|---------|-----------|-----------|
| `npm run dev` | `frontend/` | Servidor de desenvolvimento Vite |
| `npm run build` | `frontend/` | Build de producao (TypeScript + Vite) |
| `npm run preview` | `frontend/` | Preview do build de producao |
| `npm run lint` | `frontend/` | Lint com ESLint |

## Estrutura

```
oilbird/
├── main.py                  Backend FastAPI (Markdown -> PDF)
├── colab-backend.ipynb      Notebook Colab com backend + tunnel
├── frontend/
│   ├── src/
│   │   ├── App.tsx          Aplicacao principal
│   │   ├── components/
│   │   │   ├── ApiConfig.tsx      Configuracao da URL do backend
│   │   │   ├── BetaBanner.tsx     Banner informativo
│   │   │   ├── MarkdownEditor.tsx Editor com preview ao vivo
│   │   │   └── Preloader.tsx      Animacao de carregamento
│   │   ├── hooks/
│   │   │   ├── useLenis.ts        Smooth scrolling
│   │   │   └── useScrollReveal.ts Animacoes de revelacao
│   │   ├── lib/
│   │   │   ├── api.ts             Gerenciamento da URL da API
│   │   │   └── pdf.ts             Chamada ao endpoint de geracao
│   │   ├── index.css
│   │   └── main.tsx
│   └── package.json
└── .github/workflows/deploy.yml   Deploy do frontend no GitHub Pages
```

## Arquitetura

O Oilbird segue uma arquitetura desacoplada frontend/backend:

- **Frontend (React + Vite):** Editor Markdown com preview local (conversao simples via regex). O usuario escreve, visualiza o resultado e solicita a geracao do PDF.
- **Backend (FastAPI + WeasyPrint):** Recebe o Markdown via POST em `/api/generate-pdf`, converte para HTML com template tipografico, e retorna o PDF como stream. O endpoint `/api/health` verifica disponibilidade.
- **Tunnel Cloudflare:** O notebook Colab inicia o Uvicorn na porta 8003 e expoe via `cloudflared tunnel`, gerando uma URL publica temporaria. O frontend armazena essa URL no localStorage para direcionar as requisicoes.

O fluxo de dados: `Markdown (usuario) -> POST /api/generate-pdf -> WeasyPrint (HTML+CSS -> PDF) -> Download automatico`.

## Configuracao

| Variavel | Onde | Descricao |
|----------|------|-----------|
| `badger-api-url` | localStorage (frontend) | URL base do backend (ex: `https://xxxx.trycloudflare.com`) |
| `badger-beta-banner-dismissed` | localStorage (frontend) | Controla visibilidade do banner informativo |

Nao ha arquivo `.env`. A URL da API e configurada pela interface no header do Oilbird.

## Testes

O projeto nao possui suíte de testes automatizados no momento. O backend possui o endpoint `GET /api/health` que retorna `{"status": "ok", "engine": "weasyprint"}` para verificacao manual.

## Troubleshooting

| Problema | Solucao |
|----------|---------|
| "Configure a URL da API primeiro" | Clique em "Sem API" no header e cole a URL do tunnel Cloudflare |
| "Erro ao gerar PDF. Verifique se o backend esta online." | Reexecute as celulas do Colab e atualize a URL do tunnel |
| PDF sem formatacao | Verifique se o backend esta rodando (o template CSS e aplicado server-side) |
| Tunnel Cloudflare nao gera URL | Aguarde ate 30 segundos; reexecute a celula do tunnel |
| Porta 8003 ocupada | Altere a porta no comando `uvicorn` e na celula do tunnel |

## Contribuindo

1. Fork o repositorio em [github.com/xAngryBadger/oilbird](https://github.com/xAngryBadger/oilbird)
2. Crie uma branch: `git checkout -b minha-feature`
3. Commit: `git commit -m "Adiciona minha-feature"`
4. Push: `git push origin minha-feature`
5. Abra um Pull Request

## Licenca

MIT
