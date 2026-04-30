import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RollerConfigurator from './pages/RollerConfigurator';
import Home from './pages/Home';
import RFQCart from './pages/RFQCart';
import Catalog from './pages/Catalog';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/RollerConfigurator" element={<RollerConfigurator />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/RFQCart" element={<RFQCart />} />
        <Route path="/Catalog" element={<Catalog />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
