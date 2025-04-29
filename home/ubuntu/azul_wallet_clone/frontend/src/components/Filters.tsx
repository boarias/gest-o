import React, { useState, ChangeEvent } from 'react';
import { Filter, Download, PlusCircle } from 'lucide-react';
import { OpcoesFiltro, FiltrosAtivos } from '../types'; // Importar tipos

interface FiltersProps {
  opcoes: OpcoesFiltro;
  onFilterChange: (filtros: FiltrosAtivos) => void;
  onExport: () => void;
  onAddNew: () => void;
}

const Filters: React.FC<FiltersProps> = ({ opcoes, onFilterChange, onExport, onAddNew }) => {
  const [filtros, setFiltros] = useState<FiltrosAtivos>({
    situacao: '',
    titular: '',
    emissor: '',
    data_inicio: '',
    data_fim: ''
  });

  const handleChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    const novosFiltros = { ...filtros, [name]: value };
    setFiltros(novosFiltros);
    onFilterChange(novosFiltros); // Notifica o componente pai sobre a mudança
  };

  const handleClearFilters = () => {
    const filtrosLimpos: FiltrosAtivos = {
      situacao: '',
      titular: '',
      emissor: '',
      data_inicio: '',
      data_fim: ''
    };
    setFiltros(filtrosLimpos);
    onFilterChange(filtrosLimpos); // Notifica o componente pai
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center">
          <Filter className="mr-2" size={20} />
          Filtros
        </h2>
        <div className="flex space-x-2 mt-2 md:mt-0">
          <button
            onClick={onExport}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <Download size={16} className="mr-1" />
            Exportar CSV
          </button>
          <button
            onClick={onAddNew}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={16} className="mr-1" />
            Novo Registro
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Filtro por Situação */}
        <div>
          <label htmlFor="situacao" className="block text-sm font-medium text-gray-700 mb-1">
            Situação
          </label>
          <select
            id="situacao"
            name="situacao"
            value={filtros.situacao}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas Situações</option>
            {opcoes.situacoes.map((situacao, index) => (
              <option key={index} value={situacao}>
                {situacao}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Titular */}
        <div>
          <label htmlFor="titular" className="block text-sm font-medium text-gray-700 mb-1">
            Titular
          </label>
          <select
            id="titular"
            name="titular"
            value={filtros.titular}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos Titulares</option>
            {opcoes.titulares.map((titular, index) => (
              <option key={index} value={titular}>
                {titular}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Emissor */}
        <div>
          <label htmlFor="emissor" className="block text-sm font-medium text-gray-700 mb-1">
            Emissor
          </label>
          <select
            id="emissor"
            name="emissor"
            value={filtros.emissor}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos Emissores</option>
            {opcoes.emissores.map((emissor, index) => (
              <option key={index} value={emissor}>
                {emissor}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Data Início */}
        <div>
          <label htmlFor="data_inicio" className="block text-sm font-medium text-gray-700 mb-1">
            Data Início
          </label>
          <input
            type="date"
            id="data_inicio"
            name="data_inicio"
            value={filtros.data_inicio}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filtro por Data Fim */}
        <div>
          <label htmlFor="data_fim" className="block text-sm font-medium text-gray-700 mb-1">
            Data Fim
          </label>
          <input
            type="date"
            id="data_fim"
            name="data_fim"
            value={filtros.data_fim}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Botão para limpar filtros */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleClearFilters}
          className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          Limpar Filtros
        </button>
      </div>
    </div>
  );
};

export default Filters;

