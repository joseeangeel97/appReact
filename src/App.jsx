import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import About from './pages/About';
import Hall from './pages/Hall';
import PageEvent from './pages/pageEvent';
import Profile from './pages/profile';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Hall />} />
          <Route path='/login' element={<Login />} />
          <Route path='/about' element={<About />} />
          <Route path='/page-event' element={<PageEvent />} />
          <Route path='/profile' element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
