import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home';
import DonghuaChain from './pages/DonghuaChain';
import Catalog from './pages/Catalog';
import SpecialChains from './pages/SpecialChains';
import ElevatorBuckets from './pages/ElevatorBuckets';
import WeldedSteel from './pages/WeldedSteel';
import Status from './pages/Status';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/DonghuaChain" element={<DonghuaChain />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/SpecialChains" element={<SpecialChains />} />
        <Route path="/ElevatorBuckets" element={<ElevatorBuckets />} />
        <Route path="/WeldedSteel" element={<WeldedSteel />} />
        <Route path="/Status" element={<Status />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
