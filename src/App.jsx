import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Catalog from './pages/Catalog';
import ForgedChain from './pages/ForgedChain';
import ForgedChainConfigurator from './pages/ForgedChainConfigurator';
import Home from './pages/Home';
import RFQCart from './pages/RFQCart';
import RollerConfigurator from './pages/RollerConfigurator';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/ForgedChain" element={<ForgedChain />} />
        <Route path="/ForgedChainConfigurator" element={<ForgedChainConfigurator />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/RFQCart" element={<RFQCart />} />
        <Route path="/RollerConfigurator" element={<RollerConfigurator />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
