import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ElevatorBuckets from './pages/ElevatorBuckets';
import RollerConfigurator from './pages/RollerConfigurator';
import ForgedChainConfigurator from './pages/ForgedChainConfigurator';
import ForgedChain from './pages/ForgedChain';
import Catalog from './pages/Catalog';
import RFQCart from './pages/RFQCart';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/ElevatorBuckets" element={<ElevatorBuckets />} />
        <Route path="/RollerConfigurator" element={<RollerConfigurator />} />
        <Route path="/ForgedChainConfigurator" element={<ForgedChainConfigurator />} />
        <Route path="/ForgedChain" element={<ForgedChain />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/RFQCart" element={<RFQCart />} />
        <Route path="/Home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
