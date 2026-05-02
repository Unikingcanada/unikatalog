import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Catalog from './pages/Catalog';
import Home from './pages/Home';
import RollerConfigurator from './pages/RollerConfigurator';
import ForgedChainConfigurator from './pages/ForgedChainConfigurator';
import RFQCart from './pages/RFQCart';
import ForgedChain from './pages/ForgedChain';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/RollerConfigurator" element={<RollerConfigurator />} />
        <Route path="/ForgedChainConfigurator" element={<ForgedChainConfigurator />} />
        <Route path="/RFQCart" element={<RFQCart />} />
        <Route path="/ForgedChain" element={<ForgedChain />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
