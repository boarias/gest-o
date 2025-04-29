import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { X } from 'lucide-react';
import { Venda, OpcoesFiltro } from '../types';

interface SalesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vendaData: Partial<Venda>) => void;
  vendaInicial: Venda | null;
  opcoes: OpcoesFiltro;
  error: string | null;
  setError: (error: string | null) => void;
}

// Define a type for the form data, excluding calculated fields and IDs
type FormDataState = Omit<Partial<Venda>, 'id' | 'created_at' | 'desagio_percentual' | 'lucro'>;

const SalesForm: React.FC<SalesFormProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  vendaInicial, 
  opcoes, 
  error, 
  setError 
}) => {
  const initialFormData: FormDataState = {
    data_venda: new Date().toISOString().split('T')[0], // Data atual como padrão
    cliente: '',
    situacao: 'APROVADO',
    localizador: '',
    origem: '',
    titular: '',
    valor_wallet: 0,
    custo_wallet: 0,
    valor_venda: 0,
    emissor: '',
    financeiro: 'PAGO'
  };

  const [formData, setFormData] = useState<FormDataState>(initialFormData);

  // Quando o componente é montado ou quando vendaInicial muda
  useEffect(() => {
    if (vendaInicial) {
      // Se estiver editando, preenche o formulário com os dados existentes
      // Exclui campos calculados/automáticos que não devem ser editados diretamente
      const { id, created_at, desagio_percentual, lucro, ...editableData } = vendaInicial;
      setFormData({
        ...editableData,
        // Garante que a data esteja no formato correto para o input date (YYYY-MM-DD)
        data_venda: editableData.data_venda ? editableData.data_venda.split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else {
      // Se estiver criando novo, reseta para os valores padrão
      setFormData({
        ...initialFormData,
        titular: opcoes.titulares?.[0] || '', // Usa o primeiro titular como padrão se existir
        emissor: opcoes.emissores?.[0] || '', // Usa o primeiro emissor como padrão se existir
        situacao: opcoes.situacoes?.[0] || 'APROVADO', // Usa a primeira situação como padrão
        financeiro: opcoes.financeiros?.[0] || 'PAGO' // Usa o primeiro financeiro como padrão
      });
    }
  }, [vendaInicial, opcoes]);

  // Função para calcular o custo wallet com base no valor wallet
  const calcularCustoWallet = (valorWallet: number): number => {
    // Regra: Custo = 90% do Valor Wallet
    return parseFloat((valorWallet * 0.9).toFixed(2));
  };

  // Função para calcular o deságio percentual
  const calcularDesagio = (valorWallet: number, custoWallet: number): number => {
    if (!valorWallet || valorWallet === 0) return 0;
    return parseFloat((((valorWallet - custoWallet) / valorWallet) * 100).toFixed(2));
  };

  // Função para calcular o lucro
  const calcularLucro = (valorVenda: number, custoWallet: number): number => {
    return parseFloat((valorVenda - custoWallet).toFixed(2));
  };

  // Manipulador de mudanças nos campos do formulário
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue: string | number = value;
    
    // Converte valores numéricos
    if (['valor_wallet', 'custo_wallet', 'valor_venda'].includes(name)) {
      newValue = parseFloat(value) || 0;
    }

    // Atualiza o estado do formulário
    setFormData(prev => {
      const updatedData = { ...prev, [name]: newValue };
      
      // Recalcula custo_wallet quando valor_wallet muda
      if (name === 'valor_wallet') {
        const valorWalletNum = typeof newValue === 'number' ? newValue : parseFloat(newValue) || 0;
        updatedData.custo_wallet = calcularCustoWallet(valorWalletNum);
      }
      
      return updatedData;
    });

    // Limpa o erro ao modificar o formulário
    if (error) {
      setError(null);
    }
  };

  // Manipulador de envio do formulário
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validação básica (campos obrigatórios conforme definido nos requisitos)
    if (!formData.data_venda || !formData.cliente || !formData.situacao || !formData.localizador || !formData.origem || !formData.titular || formData.valor_wallet === undefined || formData.valor_wallet <= 0 || !formData.emissor || formData.valor_venda === undefined || formData.valor_venda <= 0) {
      setError('Por favor, preencha todos os campos obrigatórios (*) com valores válidos.');
      return;
    }
    
    // Cria o objeto final para salvar, incluindo os campos calculados
    const vendaParaSalvar: Partial<Venda> = {
      ...formData,
      // Adiciona os campos calculados no momento do save
      custo_wallet: calcularCustoWallet(formData.valor_wallet || 0),
      // O backend recalculará desagio e lucro, mas podemos enviar uma estimativa
      // desagio_percentual: calcularDesagio(formData.valor_wallet || 0, formData.custo_wallet || 0),
      // lucro: calcularLucro(formData.valor_venda || 0, formData.custo_wallet || 0)
    };

    // Remove campos que não devem ser enviados (ex: id se for criação)
    if (!vendaInicial) {
      delete vendaParaSalvar.id;
    }

    // Envia os dados para o componente pai
    onSave(vendaParaSalvar);
  };

  if (!isOpen) return null;

  // Calcula os valores de deságio e lucro para exibição (não são enviados, backend calcula)
  const displayCustoWallet = calcularCustoWallet(formData.valor_wallet || 0);
  const displayDesagio = calcularDesagio(formData.valor_wallet || 0, displayCustoWallet);
  const displayLucro = calcularLucro(formData.valor_venda || 0, displayCustoWallet);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-800">
            {vendaInicial ? 'Editar Registro' : 'Novo Registro'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded relative" role="alert">
            <strong className="font-bold">Erro: </strong>
            <span className="block sm:inline">{error}</span>
            <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <span className="text-2xl">&times;</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Data */}
            <div>
              <label htmlFor="data_venda" className="block text-sm font-medium text-gray-700 mb-1">
                Data *
              </label>
              <input
                type="date"
                id="data_venda"
                name="data_venda"
                value={formData.data_venda || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Cliente */}
            <div>
              <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">
                Cliente *
              </label>
              <input
                type="text"
                id="cliente"
                name="cliente"
                value={formData.cliente || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Situação */}
            <div>
              <label htmlFor="situacao" className="block text-sm font-medium text-gray-700 mb-1">
                Situação *
              </label>
              <select
                id="situacao"
                name="situacao"
                value={formData.situacao || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {opcoes.situacoes && opcoes.situacoes.length > 0 ? (
                  opcoes.situacoes.map((situacao, index) => (
                    <option key={index} value={situacao}>
                      {situacao}
                    </option>
                  ))
                ) : (
                  // Fallback se opções não carregarem
                  <>
                    <option value="APROVADO">APROVADO</option>
                    <option value="PENDENTE">PENDENTE</option>
                    <option value="CANCELADO">CANCELADO</option>
                  </>
                )}
              </select>
            </div>

            {/* Localizador */}
            <div>
              <label htmlFor="localizador" className="block text-sm font-medium text-gray-700 mb-1">
                Localizador *
              </label>
              <input
                type="text"
                id="localizador"
                name="localizador"
                value={formData.localizador || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Origem */}
            <div>
              <label htmlFor="origem" className="block text-sm font-medium text-gray-700 mb-1">
                Origem *
              </label>
              <input
                type="text"
                id="origem"
                name="origem"
                value={formData.origem || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Titular */}
            <div>
              <label htmlFor="titular" className="block text-sm font-medium text-gray-700 mb-1">
                Titular *
              </label>
              <select
                id="titular"
                name="titular"
                value={formData.titular || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecione...</option>
                {opcoes.titulares?.map((titular, index) => (
                  <option key={index} value={titular}>
                    {titular}
                  </option>
                ))}
              </select>
            </div>

            {/* Valor Wallet */}
            <div>
              <label htmlFor="valor_wallet" className="block text-sm font-medium text-gray-700 mb-1">
                Valor Wallet (R$) *
              </label>
              <input
                type="number"
                id="valor_wallet"
                name="valor_wallet"
                value={formData.valor_wallet || ''}
                onChange={handleChange}
                step="0.01"
                min="0.01" // Valor deve ser maior que zero
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Custo Wallet (calculado automaticamente) */}
            <div>
              <label htmlFor="custo_wallet_display" className="block text-sm font-medium text-gray-700 mb-1">
                Custo Wallet (R$)
              </label>
              <input
                type="text" // Display as text
                id="custo_wallet_display"
                value={displayCustoWallet.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                readOnly
              />
              <small className="text-gray-500">Calculado (90% do V. Wallet)</small>
            </div>

            {/* Deságio (calculado automaticamente) */}
            <div>
              <label htmlFor="desagio_display" className="block text-sm font-medium text-gray-700 mb-1">
                Deságio (%)
              </label>
              <input
                type="text"
                id="desagio_display"
                value={displayDesagio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'}
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                readOnly
              />
              <small className="text-gray-500">Calculado</small>
            </div>

            {/* Valor de Venda */}
            <div>
              <label htmlFor="valor_venda" className="block text-sm font-medium text-gray-700 mb-1">
                Valor de Venda (R$) *
              </label>
              <input
                type="number"
                id="valor_venda"
                name="valor_venda"
                value={formData.valor_venda || ''}
                onChange={handleChange}
                step="0.01"
                min="0.01" // Valor deve ser maior que zero
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Lucro (calculado automaticamente) */}
            <div>
              <label htmlFor="lucro_display" className="block text-sm font-medium text-gray-700 mb-1">
                Lucro (R$)
              </label>
              <input
                type="text"
                id="lucro_display"
                value={displayLucro.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                className={`w-full p-2 border border-gray-300 rounded-md bg-gray-100 ${displayLucro < 0 ? 'text-red-600' : 'text-green-600'}`}
                readOnly
              />
              <small className="text-gray-500">Calculado (V. Venda - Custo)</small>
            </div>

            {/* Emissor */}
            <div>
              <label htmlFor="emissor" className="block text-sm font-medium text-gray-700 mb-1">
                Emissor *
              </label>
              <select
                id="emissor"
                name="emissor"
                value={formData.emissor || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecione...</option>
                {opcoes.emissores?.map((emissor, index) => (
                  <option key={index} value={emissor}>
                    {emissor}
                  </option>
                ))}
              </select>
            </div>

            {/* Financeiro */}
            <div>
              <label htmlFor="financeiro" className="block text-sm font-medium text-gray-700 mb-1">
                Financeiro
              </label>
              <select
                id="financeiro"
                name="financeiro"
                value={formData.financeiro || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {opcoes.financeiros && opcoes.financeiros.length > 0 ? (
                  opcoes.financeiros.map((financeiro, index) => (
                    <option key={index} value={financeiro}>
                      {financeiro}
                    </option>
                  ))
                ) : (
                  // Fallback
                  <>
                    <option value="PAGO">PAGO</option>
                    <option value="PENDENTE">PENDENTE</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3 sticky bottom-0 bg-white py-4 px-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {vendaInicial ? 'Atualizar Registro' : 'Adicionar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesForm;

