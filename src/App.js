import './App.css';
import MapComponent from './components/map.component';
import CoucheRoulementComponent from './components/couche-roulement.component';
import { HashRouter , Routes, Route } from 'react-router-dom';

function App() {

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MapComponent />} />
        <Route path="/couche" element={<CoucheRoulementComponent />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
