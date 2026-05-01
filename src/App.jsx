import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home';
import ForgedChainConfigurator from './pages/ForgedChainConfigurator';
import RFQCart from './pages/RFQCart';
import Catalog from './pages/Catalog';
import RollerConfigurator from './pages/RollerConfigurator';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/ForgedChainConfigurator" element={<ForgedChainConfigurator />} />
        <Route path="/RFQCart" element={<RFQCart />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/RollerConfigurator" element={<RollerConfigurator />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
