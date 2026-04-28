import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SpecialChains from './pages/SpecialChains';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import DonghuaChain from './pages/DonghuaChain';
import WeldedSteel from './pages/WeldedSteel';
import ElevatorBuckets from './pages/ElevatorBuckets';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/SpecialChains" element={<SpecialChains />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/DonghuaChain" element={<DonghuaChain />} />
        <Route path="/WeldedSteel" element={<WeldedSteel />} />
        <Route path="/ElevatorBuckets" element={<ElevatorBuckets />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
