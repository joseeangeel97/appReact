import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Hall from './pages/Hall';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/hall' element={<Hall />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
