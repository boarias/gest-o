-- 1. Criação da Tabela `vendas`

CREATE TABLE public.vendas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    data_venda date NOT NULL,
    cliente text NOT NULL,
    situacao text NOT NULL,
    localizador text NOT NULL,
    origem text NOT NULL,
    titular text NOT NULL,
    valor_wallet numeric(10, 2) NOT NULL,
    custo_wallet numeric(10, 2) NOT NULL,
    valor_venda numeric(10, 2) NOT NULL,
    emissor text NOT NULL,
    financeiro text NOT NULL,
    desagio_percentual numeric(5, 2) GENERATED ALWAYS AS (
        CASE
            WHEN (valor_wallet = (0)::numeric) THEN (0)::numeric
            ELSE round((((valor_wallet - custo_wallet) / valor_wallet) * (100)::numeric), 2)
        END) STORED,
    lucro numeric(10, 2) GENERATED ALWAYS AS ((valor_venda - custo_wallet)) STORED
);

ALTER TABLE public.vendas OWNER TO postgres;

ALTER TABLE ONLY public.vendas
    ADD CONSTRAINT vendas_pkey PRIMARY KEY (id);

-- Habilitar Row Level Security (RLS) - Boa prática no Supabase
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS (Exemplo: permitir acesso total a usuários autenticados)
-- Adapte conforme suas regras de autenticação e autorização
CREATE POLICY "Allow all authenticated users" ON public.vendas
    FOR ALL
    USING (auth.role() = 'authenticated');
    -- Se a API for pública (usando anon key), pode ser necessário:
    -- CREATE POLICY "Allow public read access" ON public.vendas
    -- FOR SELECT USING (true);
    -- CREATE POLICY "Allow public insert access" ON public.vendas
    -- FOR INSERT WITH CHECK (true);
    -- CREATE POLICY "Allow public update access" ON public.vendas
    -- FOR UPDATE USING (true);
    -- CREATE POLICY "Allow public delete access" ON public.vendas
    -- FOR DELETE USING (true);


-- 2. Função RPC para buscar valores distintos para filtros

CREATE OR REPLACE FUNCTION public.get_distinct_values(column_name text)
 RETURNS TABLE(distinct_value text)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY EXECUTE format(
    'SELECT DISTINCT %I::text FROM public.vendas ORDER BY 1',
    column_name
  );
END;
$function$;

ALTER FUNCTION public.get_distinct_values(text) OWNER TO postgres;

-- Grant execute permission (adapt role if needed)
GRANT EXECUTE ON FUNCTION public.get_distinct_values(text) TO authenticated;
-- GRANT EXECUTE ON FUNCTION public.get_distinct_values(text) TO anon; -- Se for acesso público


-- 3. Função RPC para buscar indicadores do Dashboard

CREATE OR REPLACE FUNCTION public.get_dashboard_indicators()
 RETURNS TABLE(total_registros bigint, total_vendas numeric, total_lucro numeric, desagio_medio numeric)
 LANGUAGE sql
 STABLE
AS $function$
  SELECT
    COUNT(*) AS total_registros,
    COALESCE(SUM(valor_venda), 0) AS total_vendas,
    COALESCE(SUM(lucro), 0) AS total_lucro,
    COALESCE(AVG(desagio_percentual), 0) AS desagio_medio
  FROM public.vendas;
$function$;

ALTER FUNCTION public.get_dashboard_indicators() OWNER TO postgres;

-- Grant execute permission (adapt role if needed)
GRANT EXECUTE ON FUNCTION public.get_dashboard_indicators() TO authenticated;
-- GRANT EXECUTE ON FUNCTION public.get_dashboard_indicators() TO anon; -- Se for acesso público


-- 4. Função RPC para buscar saldos por titular

CREATE OR REPLACE FUNCTION public.get_balances_by_titular()
 RETURNS TABLE(titular text, saldo_lucro numeric)
 LANGUAGE sql
 STABLE
AS $function$
  SELECT
    v.titular,
    COALESCE(SUM(v.lucro), 0) AS saldo_lucro
  FROM public.vendas v
  GROUP BY v.titular
  ORDER BY v.titular;
$function$;

ALTER FUNCTION public.get_balances_by_titular() OWNER TO postgres;

-- Grant execute permission (adapt role if needed)
GRANT EXECUTE ON FUNCTION public.get_balances_by_titular() TO authenticated;
-- GRANT EXECUTE ON FUNCTION public.get_balances_by_titular() TO anon; -- Se for acesso público


