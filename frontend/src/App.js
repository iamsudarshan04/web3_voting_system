import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './contexts/Web3Context';
import Header from './components/Header';
import Home from './pages/Home';
import Elections from './pages/Elections';
import ElectionDetail from './pages/ElectionDetail';
import CreateElection from './pages/CreateElection';
import Results from './pages/Results';
import './App.css';

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/elections" element={<Elections />} />
              <Route path="/election/:id" element={<ElectionDetail />} />
              <Route path="/create" element={<CreateElection />} />
              <Route path="/results/:id" element={<Results />} />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;