import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ForgedChainConfigurator from './pages/ForgedChainConfigurator';
import Catalog from './pages/Catalog';
import RFQCart from './pages/RFQCart';
import RollerConfigurator from './pages/RollerConfigurator';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/ForgedChainConfigurator" element={<ForgedChainConfigurator />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/RFQCart" element={<RFQCart />} />
        <Route path="/RollerConfigurator" element={<RollerConfigurator />} />
        <Route path="/Home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
