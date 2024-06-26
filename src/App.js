import './App.css';
import MapComponent from './components/map.component';
import CoucheRoulementComponent from './components/couche-roulement.component';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createBrowserHistory } from "history";

function App() {

  const history = createBrowserHistory();
  return (
    <Router history={history}>
      <Routes>
        <Route path="/" element={<MapComponent />} />
        <Route path="/couche" element={<CoucheRoulementComponent />} />
      </Routes>
    </Router>
  );
}

export default App;
