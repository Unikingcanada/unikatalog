import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RFQCart from './pages/RFQCart';
import Catalog from './pages/Catalog';
import Home from './pages/Home';
import RollerConfigurator from './pages/RollerConfigurator';
import ElevatorBuckets from './pages/ElevatorBuckets';
import ForgedChain from './pages/ForgedChain';
import ForgedChainConfigurator from './pages/ForgedChainConfigurator';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/RFQCart" element={<RFQCart />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/RollerConfigurator" element={<RollerConfigurator />} />
        <Route path="/ElevatorBuckets" element={<ElevatorBuckets />} />
        <Route path="/ForgedChain" element={<ForgedChain />} />
        <Route path="/ForgedChainConfigurator" element={<ForgedChainConfigurator />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
