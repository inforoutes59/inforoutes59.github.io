import './App.css';
import MapComponent from './components/map.component';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapComponent />} />
        <Route path="/couche" element={<CoucheRoulementComponent />} />
      </Routes>
    </Router>
  );
}

export default App;
