import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Weather from './components/WeatherApp.jsx'

const App = () => {
  return (
      <Router>
        <Routes>
          <Route path='/' element={<Weather/>}/>
        </Routes>
      </Router>
  );
}

export default App;
