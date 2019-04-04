import React, { Component } from 'react';
import './App.css';
import 'typeface-roboto';
import MainLayout from './components/Layouts/MainLayout';

class App extends Component {
  render() {
    return (
      <div className="App">
        <MainLayout/>
      </div>
    );
  }
}

export default App;
