import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RFQCart from './pages/RFQCart';
import Home from './pages/Home';
import Catalog from './pages/Catalog';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/RFQCart" element={<RFQCart />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Catalog" element={<Catalog />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
