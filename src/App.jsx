import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Status from './pages/Status';
import Home from './pages/Home';
import DonghuaChain from './pages/DonghuaChain';
import SpecialChains from './pages/SpecialChains';
import WeldedSteel from './pages/WeldedSteel';
import ElevatorBuckets from './pages/ElevatorBuckets';
import Catalog from './pages/Catalog';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Status" element={<Status />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/DonghuaChain" element={<DonghuaChain />} />
        <Route path="/SpecialChains" element={<SpecialChains />} />
        <Route path="/WeldedSteel" element={<WeldedSteel />} />
        <Route path="/ElevatorBuckets" element={<ElevatorBuckets />} />
        <Route path="/Catalog" element={<Catalog />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
