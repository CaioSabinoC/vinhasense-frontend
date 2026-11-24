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

- Dashboard com indicadores ambientais.
- Visualização da umidade do solo.
- Monitoramento da temperatura e umidade do ar.
- Acompanhamento do estado do dispositivo ESP32-C3.
- Cadastro e gerenciamento de safras.
- Visualização individual das safras.
- Previsão estimada de colheita.
- Alertas baseados nas faixas configuradas.
- Gráficos históricos das leituras.
- Exportação de relatórios em CSV e impressão em PDF.
- Configuração das faixas de alerta e aparência da interface.

## Integração com o backend

O frontend consome a API REST do VinhaSense utilizando `fetch()` e o caminho-base `/api`.

Principais endpoints utilizados:

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/leituras/ultima` | Consulta a última leitura |
| GET | `/api/leituras` | Consulta o histórico de leituras |
| GET | `/api/safras` | Lista as safras cadastradas |
| POST | `/api/safras` | Cadastra uma nova safra |
| GET | `/api/safras/previsao` | Consulta as previsões de colheita |

Na infraestrutura de produção, o Nginx recebe as requisições e encaminha as chamadas iniciadas por `/api/` para o backend Node.js.

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

**Observação:** para testar a integração com a API durante o desenvolvimento local, é necessário disponibilizar o backend no mesmo contexto de origem por meio de um proxy ou configuração equivalente. A configuração de desenvolvimento atual do Vite não define esse proxy.

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
│   ├── data/
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
