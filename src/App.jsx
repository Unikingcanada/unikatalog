import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Catalog from './pages/Catalog';
import WeldedSteel from './pages/WeldedSteel';
import ElevatorBuckets from './pages/ElevatorBuckets';
import Home from './pages/Home';
import DonghuaChain from './pages/DonghuaChain';
import SpecialChains from './pages/SpecialChains';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/WeldedSteel" element={<WeldedSteel />} />
        <Route path="/ElevatorBuckets" element={<ElevatorBuckets />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/DonghuaChain" element={<DonghuaChain />} />
        <Route path="/SpecialChains" element={<SpecialChains />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
