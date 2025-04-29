# Backend - Gestor de Vendas (Azul Wallet Clone)

Este diretório contém o código do servidor backend para a aplicação de gestão de vendas.

## Tecnologias

*   Node.js
*   Express.js
*   Supabase (PostgreSQL)
*   dotenv
*   cors

## Configuração

1.  **Instalar dependências:**
    ```bash
    npm install
    ```
2.  **Configurar Variáveis de Ambiente:**
    *   Renomeie ou copie o arquivo `.env.example` (ou crie um novo `.env` se não existir) para `.env`.
    *   Edite o arquivo `.env` e substitua os valores de placeholder pelas suas credenciais reais do Supabase:
        ```dotenv
        SUPABASE_URL=SUA_SUPABASE_URL_AQUI
        SUPABASE_ANON_KEY=SUA_SUPABASE_ANON_KEY_AQUI
        PORT=3001
        ```
    *   Você pode obter a `SUPABASE_URL` e a `SUPABASE_ANON_KEY` nas configurações do seu projeto Supabase (Project Settings > API).
3.  **Configurar Banco de Dados Supabase:**
    *   Acesse o "SQL Editor" no seu projeto Supabase.
    *   Execute o script SQL fornecido em `../supabase_setup.sql` para criar a tabela `vendas` e as funções necessárias.

## Execução

Para iniciar o servidor backend:

```bash
npm start
```

O servidor estará rodando em `http://localhost:3001` (ou na porta definida em `.env`).

## API Endpoints

*   `GET /`: Rota de teste.
*   `GET /api/vendas`: Busca todas as vendas (suporta query params para filtros: `situacao`, `titular`, `emissor`, `data_inicio`, `data_fim`).
*   `POST /api/vendas`: Cria uma nova venda.
*   `PUT /api/vendas/:id`: Atualiza uma venda existente.
*   `DELETE /api/vendas/:id`: Deleta uma venda.
*   `GET /api/indicadores`: Busca os indicadores para o dashboard (total de registros, vendas, lucro, deságio médio).
*   `GET /api/saldos`: Busca os saldos de lucro agrupados por titular.
*   `GET /api/opcoes/:campo`: Busca valores distintos para um campo específico (usado para preencher filtros: `titular`, `emissor`, `situacao`, `financeiro`).

