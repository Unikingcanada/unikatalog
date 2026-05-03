import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ForgedChain from './pages/ForgedChain';
import Home from './pages/Home';
import RFQCart from './pages/RFQCart';
import ElevatorBuckets from './pages/ElevatorBuckets';
import RollerConfigurator from './pages/RollerConfigurator';
import ForgedChainConfigurator from './pages/ForgedChainConfigurator';
import Catalog from './pages/Catalog';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/ForgedChain" element={<ForgedChain />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/RFQCart" element={<RFQCart />} />
        <Route path="/ElevatorBuckets" element={<ElevatorBuckets />} />
        <Route path="/RollerConfigurator" element={<RollerConfigurator />} />
        <Route path="/ForgedChainConfigurator" element={<ForgedChainConfigurator />} />
        <Route path="/Catalog" element={<Catalog />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
