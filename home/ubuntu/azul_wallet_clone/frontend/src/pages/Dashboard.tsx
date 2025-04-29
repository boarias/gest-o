import React, { useState, useEffect, useCallback } from 'react';
import IndicatorCard from '../components/IndicatorCard';
import BalanceCard from '../components/BalanceCard';
import SalesTable from '../components/SalesTable';
import SalesForm from '../components/SalesForm'; // Componente do modal/formulário
import Filters from '../components/Filters'; // Componente dos filtros
import { getIndicadores, getSaldos, getVendas, getOpcoes, createVenda, updateVenda, deleteVenda } from '../services/api';
// import { PlusCircle, Download } from 'lucide-react'; // Removed as unused for now
import { utils, writeFile } from 'xlsx'; // Usaremos xlsx para exportar CSV/Excel
import { Venda, Indicadores as IndicadoresType, Saldo, OpcoesFiltro, FiltrosAtivos } from '../types'; // Importar tipos

const Dashboard: React.FC = () => {
    const [indicadores, setIndicadores] = useState<IndicadoresType>({ total_registros: 0, total_vendas: 0, total_lucro: 0, desagio_medio: 0 });
    const [saldos, setSaldos] = useState<Saldo[]>([]);
    const [vendas, setVendas] = useState<Venda[]>([]);
    const [opcoesFiltro, setOpcoesFiltro] = useState<OpcoesFiltro>({ titulares: [], emissores: [], situacoes: [], financeiros: ['Pago', 'Pendente'] }); // Adicionado financeiros aqui
    const [filtrosAtivos, setFiltrosAtivos] = useState<FiltrosAtivos>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [vendaParaEditar, setVendaParaEditar] = useState<Venda | null>(null);

    // Função para buscar todos os dados iniciais
    const fetchData = useCallback(async (filtros: FiltrosAtivos = {}) => {
        setLoading(true);
        setError(null);
        try {
            // Filtrar chaves vazias antes de enviar para a API
            const filtrosValidos = Object.entries(filtros)
                .filter(([, value]) => value !== '' && value !== null && value !== undefined)
                .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

            const [indicadoresRes, saldosRes, vendasRes, titularesRes, emissoresRes, situacoesRes] = await Promise.all([
                getIndicadores(),
                getSaldos(),
                getVendas(filtrosValidos), // Passa os filtros válidos para a busca de vendas
                getOpcoes('titular'),
                getOpcoes('emissor'),
                getOpcoes('situacao')
            ]);

            setIndicadores(indicadoresRes.data || { total_registros: 0, total_vendas: 0, total_lucro: 0, desagio_medio: 0 });
            setSaldos(saldosRes.data || []);
            setVendas(vendasRes.data || []);
            setOpcoesFiltro(prev => ({
                ...prev,
                titulares: titularesRes.data?.map((item: { distinct_value: string }) => item.distinct_value) || [],
                emissores: emissoresRes.data?.map((item: { distinct_value: string }) => item.distinct_value) || [],
                situacoes: situacoesRes.data?.map((item: { distinct_value: string }) => item.distinct_value) || []
            }));

        } catch (err: any) { // Tipagem do erro
            console.error("Erro ao buscar dados:", err);
            setError(err.response?.data?.error || err.message || 'Falha ao carregar dados. Verifique a conexão com a API e o banco de dados.');
            // Define valores padrão em caso de erro para evitar quebras
            setIndicadores({ total_registros: 0, total_vendas: 0, total_lucro: 0, desagio_medio: 0 });
            setSaldos([]);
            setVendas([]);
            setOpcoesFiltro(prev => ({ ...prev, titulares: [], emissores: [], situacoes: [] }));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(filtrosAtivos);
    }, [fetchData, filtrosAtivos]); // Refaz a busca quando os filtros mudam

    const handleFilterChange = (novosFiltros: FiltrosAtivos) => {
        setFiltrosAtivos(novosFiltros);
    };

    const handleOpenForm = (venda: Venda | null = null) => {
        setVendaParaEditar(venda);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setVendaParaEditar(null);
    };

    const handleSaveVenda = async (vendaData: Partial<Venda>) => {
        try {
            if (vendaParaEditar) {
                await updateVenda(vendaParaEditar.id, vendaData);
            } else {
                await createVenda(vendaData);
            }
            handleCloseForm();
            fetchData(filtrosAtivos); // Rebusca os dados após salvar
        } catch (err: any) { // Tipagem do erro
            console.error("Erro ao salvar venda:", err);
            setError(err.response?.data?.error || err.message || 'Erro ao salvar venda.');
            // Não fecha o formulário em caso de erro para o usuário corrigir
        }
    };

    const handleDeleteVenda = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este registro?')) {
            try {
                await deleteVenda(id);
                fetchData(filtrosAtivos); // Rebusca os dados após excluir
            } catch (err: any) { // Tipagem do erro
                console.error("Erro ao excluir venda:", err);
                setError(err.response?.data?.error || err.message || 'Erro ao excluir venda.');
            }
        }
    };

    const handleExportCSV = () => {
        // Mapeia os dados para o formato desejado, incluindo cabeçalhos legíveis
        const dataToExport = vendas.map((v: Venda) => ({
            'Data': v.data_venda ? new Date(v.data_venda + 'T00:00:00').toLocaleDateString('pt-BR') : '', // Ajuste para data local
            'Cliente': v.cliente,
            'Situação': v.situacao,
            'Localizador': v.localizador,
            'Origem': v.origem,
            'Titular': v.titular,
            'V. Wallet (R$)': v.valor_wallet,
            'Custo (R$)': v.custo_wallet,
            'Deságio (%)': v.desagio_percentual,
            'V. Venda (R$)': v.valor_venda,
            'Lucro (R$)': v.lucro,
            'Emissor': v.emissor,
            'Financeiro': v.financeiro
        }));

        const worksheet = utils.json_to_sheet(dataToExport);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Vendas");

        // Gera o arquivo e inicia o download
        writeFile(workbook, "gestor_vendas_export.xlsx");
    };

    // Formatação de moeda
    const formatCurrency = (value: number | string | undefined | null): string => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return (numValue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Formatação de percentual
    const formatPercent = (value: number | string | undefined | null): string => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return `${(numValue || 0).toFixed(2).replace('.', ',')}%`;
    };

    return (
        <div className="space-y-6">
            {/* Indicadores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <IndicatorCard title="Total Registros" value={indicadores.total_registros?.toString() ?? '0'} />
                <IndicatorCard title="Vendas Totais" value={formatCurrency(indicadores.total_vendas)} />
                <IndicatorCard title="Lucro Total" value={formatCurrency(indicadores.total_lucro)} />
                <IndicatorCard title="Deságio Médio" value={formatPercent(indicadores.desagio_medio)} />
            </div>

            {/* Saldos por Titular */}
            <div>
                <h2 className="text-xl font-semibold mb-3 text-gray-700">Saldos por Titular</h2>
                {loading && saldos.length === 0 && <p className="text-gray-500">Carregando saldos...</p>}
                {!loading && saldos.length === 0 && <p className="text-gray-500">Nenhum saldo encontrado.</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {saldos.map((saldo, index) => (
                        <BalanceCard key={index} titular={saldo.titular} saldo={formatCurrency(saldo.saldo_lucro)} />
                    ))}
                </div>
            </div>

            {/* Filtros e Ações */}
            <Filters
                opcoes={opcoesFiltro}
                onFilterChange={handleFilterChange}
                onExport={handleExportCSV}
                onAddNew={() => handleOpenForm()} // Passa a função para abrir o form
            />

            {/* Mensagem de Erro */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Erro: </strong>
                    <span className="block sm:inline">{error}</span>
                    <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>
            )}

            {/* Tabela de Vendas */}
            <SalesTable
                vendas={vendas}
                loading={loading}
                onEdit={handleOpenForm} // Passa a função para editar
                onDelete={handleDeleteVenda} // Passa a função para deletar
                formatCurrency={formatCurrency}
                formatPercent={formatPercent}
            />

            {/* Modal/Formulário de Venda */}
            {isFormOpen && (
                <SalesForm
                    isOpen={isFormOpen}
                    onClose={handleCloseForm}
                    onSave={handleSaveVenda}
                    vendaInicial={vendaParaEditar}
                    opcoes={opcoesFiltro} // Passa opções para dropdowns do formulário
                    error={error} // Passa o erro para exibir no formulário se necessário
                    setError={setError} // Permite limpar o erro do formulário
                />
            )}
        </div>
    );
};

export default Dashboard;

