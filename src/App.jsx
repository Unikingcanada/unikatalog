import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ForgedChainConfigurator from './pages/ForgedChainConfigurator';
import Catalog from './pages/Catalog';
import RFQCart from './pages/RFQCart';
import Home from './pages/Home';
import RollerConfigurator from './pages/RollerConfigurator';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/ForgedChainConfigurator" element={<ForgedChainConfigurator />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/RFQCart" element={<RFQCart />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/RollerConfigurator" element={<RollerConfigurator />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
