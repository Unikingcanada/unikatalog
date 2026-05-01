import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Catalog from './pages/Catalog';
import RollerConfigurator from './pages/RollerConfigurator';
import ForgedChain from './pages/ForgedChain';
import RFQCart from './pages/RFQCart';
import Home from './pages/Home';
import ForgedChainConfigurator from './pages/ForgedChainConfigurator';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/RollerConfigurator" element={<RollerConfigurator />} />
        <Route path="/ForgedChain" element={<ForgedChain />} />
        <Route path="/RFQCart" element={<RFQCart />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/ForgedChainConfigurator" element={<ForgedChainConfigurator />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
