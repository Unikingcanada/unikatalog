import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home';
import WeldedSteel from './pages/WeldedSteel';
import Catalog from './pages/Catalog';
import DonghuaChain from './pages/DonghuaChain';
import SpecialChains from './pages/SpecialChains';
import ElevatorBuckets from './pages/ElevatorBuckets';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/WeldedSteel" element={<WeldedSteel />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/DonghuaChain" element={<DonghuaChain />} />
        <Route path="/SpecialChains" element={<SpecialChains />} />
        <Route path="/ElevatorBuckets" element={<ElevatorBuckets />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
