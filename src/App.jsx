import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Catalog from './pages/Catalog';
import RFQCart from './pages/RFQCart';
import RollerConfigurator from './pages/RollerConfigurator';
import Home from './pages/Home';
import ForgedChainConfigurator from './pages/ForgedChainConfigurator';
import ForgedChain from './pages/ForgedChain';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/RFQCart" element={<RFQCart />} />
        <Route path="/RollerConfigurator" element={<RollerConfigurator />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/ForgedChainConfigurator" element={<ForgedChainConfigurator />} />
        <Route path="/ForgedChain" element={<ForgedChain />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
