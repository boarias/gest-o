import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import './index.css'; // Import Tailwind CSS

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        {/* Header Placeholder - Could add a proper header component later */}
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700">Azul Wallet - Gestor de Vendas</h1>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* Add other routes here if needed */}
          </Routes>
        </main>

        {/* Footer Placeholder */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Gestor de Vendas - Todos os direitos reservados.
        </footer>
      </div>
    </Router>
  );
}

export default App;

