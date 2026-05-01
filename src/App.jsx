import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RollerConfigurator from './pages/RollerConfigurator';
import Catalog from './pages/Catalog';
import Home from './pages/Home';
import RFQCart from './pages/RFQCart';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/RollerConfigurator" element={<RollerConfigurator />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/RFQCart" element={<RFQCart />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
