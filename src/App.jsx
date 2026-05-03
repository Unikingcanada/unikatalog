import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home';
import ElevatorBuckets from './pages/ElevatorBuckets';
import ForgedChain from './pages/ForgedChain';
import RollerConfigurator from './pages/RollerConfigurator';
import RFQCart from './pages/RFQCart';
import Catalog from './pages/Catalog';
import ForgedChainConfigurator from './pages/ForgedChainConfigurator';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/ElevatorBuckets" element={<ElevatorBuckets />} />
        <Route path="/ForgedChain" element={<ForgedChain />} />
        <Route path="/RollerConfigurator" element={<RollerConfigurator />} />
        <Route path="/RFQCart" element={<RFQCart />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/ForgedChainConfigurator" element={<ForgedChainConfigurator />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
