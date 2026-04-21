import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import './App.css'

function App() {

  return (
    
      <BrowserRouter>
        <nav style={{display: 'flex',  gap: '15px', padding: '15px', borderBottom: '1px solid #ccc' }}>          
          <Link to="/">Inicio </Link>
          <Link to="/login">Iniciar sesión </Link>
          <Link to="/register">Registrarse </Link>
        </nav>
      
        <div style={{padding: '20px'}}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      
      
      </BrowserRouter>

      
  )
}

export default App
