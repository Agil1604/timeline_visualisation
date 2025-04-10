import React from 'react';
import {BrowserRouter} from "react-router-dom";
import { AppRouter } from './routing/AppRouter';

const App = () => {
  return (
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
  )
}

export default App;