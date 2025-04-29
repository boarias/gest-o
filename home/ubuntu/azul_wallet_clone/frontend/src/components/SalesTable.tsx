import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Venda } from '../types'; // Importar tipo Venda

interface SalesTableProps {
  vendas: Venda[];
  loading: boolean;
  onEdit: (venda: Venda) => void;
  onDelete: (id: string) => void;
  formatCurrency: (value: number | string | undefined | null) => string;
  formatPercent: (value: number | string | undefined | null) => string;
}

const SalesTable: React.FC<SalesTableProps> = ({ vendas, loading, onEdit, onDelete, formatCurrency, formatPercent }) => {

  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return '';
    // A data vem como YYYY-MM-DD do banco, ajustar para exibição DD/MM/YYYY
    // Adiciona T00:00:00 para evitar problemas de fuso horário ao criar o objeto Date
    try {
      const date = new Date(dateString + 'T00:00:00');
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return dateString; // Retorna a string original em caso de erro
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Registros de Vendas</h2>
      {loading && <p className="text-center text-gray-500 py-4">Carregando registros...</p>}
      {!loading && vendas.length === 0 && <p className="text-center text-gray-500 py-4">Nenhum registro encontrado.</p>}
      {!loading && vendas.length > 0 && (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Situação</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localizador</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origem</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titular</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">V. Wallet</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Custo</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Deságio (%)</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">V. Venda</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Lucro</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emissor</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Financeiro</th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vendas.map((venda) => (
              <tr key={venda.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{formatDate(venda.data_venda)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{venda.cliente}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ venda.situacao === 'Pago' ? 'bg-green-100 text-green-800' : venda.situacao === 'A Receber' ? 'bg-yellow-100 text-yellow-800' : venda.situacao === 'Cancelado' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800' }`}>
                    {venda.situacao}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{venda.localizador}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{venda.origem}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{venda.titular}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(venda.valor_wallet)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(venda.custo_wallet)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">{formatPercent(venda.desagio_percentual)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(venda.valor_venda)}</td>
                <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium text-right ${venda.lucro < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(venda.lucro)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{venda.emissor}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{venda.financeiro}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-center space-x-2">
                  <button onClick={() => onEdit(venda)} className="text-blue-600 hover:text-blue-800" title="Editar">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => onDelete(venda.id)} className="text-red-600 hover:text-red-800" title="Excluir">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SalesTable;

