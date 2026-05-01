import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ForgedChainConfigurator from './pages/ForgedChainConfigurator';
import ForgedChain from './pages/ForgedChain';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import RFQCart from './pages/RFQCart';
import RollerConfigurator from './pages/RollerConfigurator';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/ForgedChainConfigurator" element={<ForgedChainConfigurator />} />
        <Route path="/ForgedChain" element={<ForgedChain />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/RFQCart" element={<RFQCart />} />
        <Route path="/RollerConfigurator" element={<RollerConfigurator />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
