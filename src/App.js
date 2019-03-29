import React, { Component } from 'react';
import 'typeface-roboto'
import './App.css';
import MainLayout from './components/Layouts/MainLayout'

class App extends Component {
  render() {
    return (
      <div className="App">
        <MainLayout />
      </div>
    );
  }
}

export default App;
