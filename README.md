# VinhaSense — Frontend

Sistema web de monitoramento inteligente de parreirais, desenvolvido para acompanhar condições ambientais, leituras de sensores, safras e previsões de colheita.

O frontend do VinhaSense oferece uma interface para visualização dos dados coletados pelos dispositivos IoT e integração com o backend do projeto.

## Equipe VinhaSense

- Arthur Vinicius
- Caio Sabino
- Marcos Vinicius
- Pedro Rodrigues
- Thauan Bezerra

## Tecnologias utilizadas

- React 18
- Vite 5
- JavaScript
- React Router DOM
- Recharts
- Lucide React
- HTML5 e CSS3

## Funcionalidades

Todos os dados vêm do banco (MongoDB) por meio da API; não há dados fictícios no código.

- Login real em 2 etapas (senha + código de app autenticador), criação de conta com QR Code e códigos de recuperação.
- Cadastro de sensores (canal do ThingSpeak) com teste de conexão e status online/offline.
- Cadastro e encerramento de safras; previsão de colheita calculada pelo servidor.
- Dashboard com umidade do solo, temperatura e umidade do ar atuais e históricos (24h, 7d, 30d).
- Alertas calculados em tempo real a partir das leituras e das faixas definidas pelo produtor.
- Relatórios com exportação em CSV e impressão em PDF.

> A temperatura exibida é a do sensor DHT11 (ar). O sistema não mede temperatura do solo.

## Primeiro uso

1. Crie sua conta e ative o app autenticador (guarde os códigos de recuperação).
2. Em **Sensores**, cadastre o ID do canal do ThingSpeak do ESP32.
3. Em **Safras**, crie a safra (variedade, área, data da poda, produtividade base).

Sem sensor cadastrado, o painel fica vazio: cada usuário só enxerga os canais que cadastrou.

## Integração com o backend

O frontend consome a API REST usando `fetch()` com o caminho-base `/api` (configurável em `VITE_API_URL`). O token de acesso fica em `sessionStorage` e é enviado em `Authorization: Bearer`.

| Método | Endpoint | Uso |
|---|---|---|
| POST | `/api/auth/registrar`, `/auth/login` | Etapa 1 (senha) |
| POST | `/api/auth/otp/confirmar`, `/auth/otp/verificar` | Etapa 2 (OTP / recuperação) |
| GET/POST/PATCH | `/api/dispositivos` | Sensores |
| GET | `/api/leituras/ultimas` | Última leitura de cada sensor |
| GET | `/api/leituras/serie` | Série por hora/dia para gráficos |
| GET | `/api/leituras` | Leituras brutas (últimas 50 do sensor) |
| GET/POST | `/api/safras`, `/safras/painel` | Safras com previsão |
| PATCH | `/api/safras/:id/encerrar` | Encerrar safra |
| GET | `/api/safras/:id/previsao`, `/previsoes` | Registrar e listar previsões |

O backend responde com e sem o prefixo `/api`, então o Nginx pode encaminhar `/api/` com ou sem remover o prefixo.

## Executando localmente

### Pré-requisitos

- Node.js 22 ou superior
- npm

### Instalação

Clone o repositório:

```bash
git clone https://github.com/Thauan-rgb/front-end-vinhasense.git
```

Acesse a pasta:

```bash
cd front-end-vinhasense
```

Instale as dependências:

```bash
npm install
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

O Vite disponibilizará a aplicação, normalmente, em:

```text
http://localhost:5173
```

**Desenvolvimento local:** o Vite encaminha `/api` para `http://localhost:3000` (backend rodando). Para outro endereço: `VITE_PROXY_TARGET=http://host:porta npm run dev`.

## Build de produção

Para gerar os arquivos otimizados:

```bash
npm run build
```

Os arquivos de produção serão gerados no diretório `dist/`.

Para visualizar o build localmente:

```bash
npm run preview
```

## Publicação na Azure

O frontend está hospedado em uma máquina virtual Microsoft Azure.

A publicação é automatizada por meio do GitHub Actions:

1. O desenvolvedor envia alterações para a branch `main`.
2. O GitHub Actions baixa o código.
3. O Node.js é configurado no ambiente de execução.
4. As dependências são instaladas com `npm ci`.
5. O projeto é compilado com `npm run build`.
6. Os arquivos gerados são enviados por SSH/rsync para a VM Azure.
7. O conteúdo é publicado em `/var/www/parreiral/`.

A automação utiliza secrets configurados no GitHub para autenticação e acesso à VM.

## Acesso à aplicação

**Aplicação publicada:**

http://vinhasense.mexicocentral.cloudapp.azure.com/

## Estrutura principal

```text
front-end-vinhasense/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── lib/
│   ├── pages/
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## Objetivo do projeto

O VinhaSense busca facilitar o acompanhamento das condições de cultivo de parreirais por meio de sensores IoT, visualização de dados e recursos de apoio à tomada de decisão.

Desenvolvido pela **Equipe VinhaSense**.
