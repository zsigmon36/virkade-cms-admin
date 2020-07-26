import React from 'react';
import VirkadeCMS from './customModules/VirkadeCMS';
import { Provider } from 'react-redux';
import configureStore from './customModules/seed/Store';
import './App.css';

const store = configureStore();

function App() {
  return (
      <Provider store={store}>
        <VirkadeCMS/>
      </Provider>
    );
  }

  export default App;