## Esquema do Banco de Dados (Supabase/PostgreSQL)

Este documento define a estrutura da tabela principal para o sistema de gestão de vendas.

**Tabela: `vendas`**

Esta tabela armazenará todos os registros de vendas.

| Nome da Coluna      | Tipo de Dado     | Restrições/Notas                                                                    | Entrada/Calculado |
| :------------------ | :--------------- | :---------------------------------------------------------------------------------- | :---------------- |
| `id`                | `uuid`           | Chave Primária, Padrão: `gen_random_uuid()`                                         | Automático        |
| `created_at`        | `timestamptz`    | Padrão: `now()`                                                                     | Automático        |
| `data_venda`        | `date`           | Não Nulo                                                                            | Entrada           |
| `cliente`           | `text`           | Não Nulo                                                                            | Entrada           |
| `situacao`          | `text`           | Não Nulo (Valores possíveis: 'Pago', 'A Receber', 'Cancelado')                      | Entrada           |
| `localizador`       | `text`           | Não Nulo                                                                            | Entrada           |
| `origem`            | `text`           | Não Nulo                                                                            | Entrada           |
| `titular`           | `text`           | Não Nulo                                                                            | Entrada           |
| `valor_wallet`      | `numeric(10, 2)` | Não Nulo                                                                            | Entrada           |
| `custo_wallet`      | `numeric(10, 2)` | Não Nulo                                                                            | Entrada           |
| `valor_venda`       | `numeric(10, 2)` | Não Nulo                                                                            | Entrada           |
| `emissor`           | `text`           | Não Nulo                                                                            | Entrada           |
| `financeiro`        | `text`           | Não Nulo                                                                            | Entrada           |
| `desagio_percentual`| `numeric(5, 2)`  | Gerado Sempre Como `(CASE WHEN valor_wallet = 0 THEN 0 ELSE ROUND(((valor_wallet - custo_wallet) / valor_wallet * 100), 2) END)` Armazenado | Calculado         |
| `lucro`             | `numeric(10, 2)` | Gerado Sempre Como `(valor_venda - custo_wallet)` Armazenado                          | Calculado         |

**Notas:**

*   **Conflito de Requisitos:** A solicitação inicial indicava que `Custo Wallet` e `Valor de Venda` eram calculados automaticamente, mas as imagens de referência do formulário mostram esses campos como entrada do usuário. O esquema acima segue as imagens de referência, tratando `Custo Wallet` e `Valor de Venda` como entradas e calculando `Deságio (%)` e `Lucro` com base neles, conforme as fórmulas implícitas e a aparência dos campos desabilitados no formulário.
*   **Campos Selecionáveis:** Os campos `Situação`, `Titular`, `Emissor` e `Financeiro` são marcados como selecionáveis na interface. No banco de dados, eles são armazenados como `text`. A lógica para preencher as opções de seleção será implementada no frontend/backend.
*   **Tipos de Dados:** `numeric(p, s)` é usado para valores monetários, garantindo precisão. `date` é usado para a data da venda. `text` é usado para campos de texto gerais.
*   **Colunas Geradas:** `desagio_percentual` e `lucro` são definidos como colunas geradas no PostgreSQL. Isso garante que os cálculos sejam feitos de forma consistente e automática pelo banco de dados sempre que os valores de entrada (`valor_wallet`, `custo_wallet`, `valor_venda`) forem inseridos ou atualizados.

