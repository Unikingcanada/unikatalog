import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ForgedChainConfigurator from './pages/ForgedChainConfigurator';
import ForgedChain from './pages/ForgedChain';
import RollerConfigurator from './pages/RollerConfigurator';
import ElevatorBuckets from './pages/ElevatorBuckets';
import RFQCart from './pages/RFQCart';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/ForgedChainConfigurator" element={<ForgedChainConfigurator />} />
        <Route path="/ForgedChain" element={<ForgedChain />} />
        <Route path="/RollerConfigurator" element={<RollerConfigurator />} />
        <Route path="/ElevatorBuckets" element={<ElevatorBuckets />} />
        <Route path="/RFQCart" element={<RFQCart />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
