import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home';
import RollerConfigurator from './pages/RollerConfigurator';
import ForgedChainConfigurator from './pages/ForgedChainConfigurator';
import ForgedChain from './pages/ForgedChain';
import Catalog from './pages/Catalog';
import RFQCart from './pages/RFQCart';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/RollerConfigurator" element={<RollerConfigurator />} />
        <Route path="/ForgedChainConfigurator" element={<ForgedChainConfigurator />} />
        <Route path="/ForgedChain" element={<ForgedChain />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/RFQCart" element={<RFQCart />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
