require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Validação das variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórias.');
    process.exit(1); // Encerra a aplicação se as variáveis não estiverem definidas
}

// Inicialização do Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: ['https://hyzrvbbz.manus.space', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rota de teste
app.get('/', (req, res) => {
    res.send('API Gestor de Vendas está funcionando!');
});

// --- ROTAS DA API --- (Serão adicionadas a seguir)

// Rota para buscar todas as vendas (com filtros)
app.get('/api/vendas', async (req, res) => {
    try {
        let query = supabase.from('vendas').select('*').order('data_venda', { ascending: false });

        // Aplicar filtros (exemplo: por situação, titular, emissor, data)
        if (req.query.situacao) {
            query = query.eq('situacao', req.query.situacao);
        }
        if (req.query.titular) {
            query = query.eq('titular', req.query.titular);
        }
        if (req.query.emissor) {
            query = query.eq('emissor', req.query.emissor);
        }
        // Adicionar filtro por data (ex: data_inicio, data_fim)
        if (req.query.data_inicio) {
            query = query.gte('data_venda', req.query.data_inicio);
        }
        if (req.query.data_fim) {
            query = query.lte('data_venda', req.query.data_fim);
        }

        const { data, error } = await query;

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar vendas:', error);
        res.status(500).json({ error: 'Erro interno ao buscar vendas', details: error.message });
    }
});

// Rota para buscar opções distintas para filtros
app.get('/api/opcoes/:campo', async (req, res) => {
    const { campo } = req.params;
    const camposValidos = ['titular', 'emissor', 'situacao', 'financeiro']; // Campos permitidos

    if (!camposValidos.includes(campo)) {
        return res.status(400).json({ error: 'Campo inválido para buscar opções.' });
    }

    try {
        // Usar RPC para chamar uma função SQL que retorna valores distintos
        const { data, error } = await supabase.rpc('get_distinct_values', { column_name: campo });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error(Erro ao buscar opções para ${campo}:, error);
        res.status(500).json({ error: Erro interno ao buscar opções para ${campo}, details: error.message });
    }
});


// Rota para criar uma nova venda
app.post('/api/vendas', async (req, res) => {
    try {
        const { data_venda, cliente, situacao, localizador, origem, titular, valor_wallet, custo_wallet, valor_venda, emissor, financeiro } = req.body;

        // Validação básica (pode ser mais robusta)
        if (!data_venda || !cliente || !situacao || !localizador || !origem || !titular || valor_wallet === undefined || custo_wallet === undefined || valor_venda === undefined || !emissor || !financeiro) {
            return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser fornecidos.' });
        }

        const { data, error } = await supabase
            .from('vendas')
            .insert([{ data_venda, cliente, situacao, localizador, origem, titular, valor_wallet, custo_wallet, valor_venda, emissor, financeiro }])
            .select(); // Retorna o registro inserido

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        console.error('Erro ao criar venda:', error);
        // Verifica erros específicos do Supabase/PostgreSQL
        if (error.code === '23505') { // Exemplo: violação de chave única
             return res.status(409).json({ error: 'Erro de conflito ao criar venda.', details: error.message });
        }
        if (error.code === '22P02') { // Exemplo: formato inválido de entrada
             return res.status(400).json({ error: 'Formato inválido para algum campo.', details: error.message });
        }
        res.status(500).json({ error: 'Erro interno ao criar venda', details: error.message });
    }
});

// Rota para atualizar uma venda existente
app.put('/api/vendas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data_venda, cliente, situacao, localizador, origem, titular, valor_wallet, custo_wallet, valor_venda, emissor, financeiro } = req.body;

        // Validação básica
        if (!data_venda || !cliente || !situacao || !localizador || !origem || !titular || valor_wallet === undefined || custo_wallet === undefined || valor_venda === undefined || !emissor || !financeiro) {
            return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser fornecidos para atualização.' });
        }

        const { data, error } = await supabase
            .from('vendas')
            .update({ data_venda, cliente, situacao, localizador, origem, titular, valor_wallet, custo_wallet, valor_venda, emissor, financeiro })
            .eq('id', id)
            .select();

        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Venda não encontrada.' });
        }
        res.json(data[0]);
    } catch (error) {
        console.error('Erro ao atualizar venda:', error);
        res.status(500).json({ error: 'Erro interno ao atualizar venda', details: error.message });
    }
});

// Rota para deletar uma venda
app.delete('/api/vendas/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error, count } = await supabase
            .from('vendas')
            .delete({ count: 'exact' })
            .eq('id', id);

        if (error) throw error;
        if (count === 0) {
             return res.status(404).json({ error: 'Venda não encontrada para exclusão.' });
        }

        res.status(204).send(); // No content
    } catch (error) {
        console.error('Erro ao deletar venda:', error);
        res.status(500).json({ error: 'Erro interno ao deletar venda', details: error.message });
    }
});

// Rota para buscar indicadores do Dashboard
app.get('/api/indicadores', async (req, res) => {
    try {
        const { data, error } = await supabase.rpc('get_dashboard_indicators');

        if (error) throw error;
        res.json(data[0] || { total_registros: 0, total_vendas: 0, total_lucro: 0, desagio_medio: 0 }); // Retorna zero se não houver dados
    } catch (error) {
        console.error('Erro ao buscar indicadores:', error);
        res.status(500).json({ error: 'Erro interno ao buscar indicadores', details: error.message });
    }
});

// Rota para buscar saldos por titular
app.get('/api/saldos', async (req, res) => {
    try {
        const { data, error } = await supabase.rpc('get_balances_by_titular');

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar saldos por titular:', error);
        res.status(500).json({ error: 'Erro interno ao buscar saldos por titular', details: error.message });
    }
});


// Iniciar o servidor
app.listen(port, () => {
    console.log(Servidor backend rodando em http://localhost:${port});
});
