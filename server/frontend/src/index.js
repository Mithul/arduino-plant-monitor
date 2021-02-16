import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter,
  Route,
} from 'react-router-dom';
import './styles/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import About from './components/About';
import reportWebVitals from './reportWebVitals';
import NavbarHeader from './components/NavbarHeader';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <NavbarHeader />
      <Route exact path='/' component={App} />
      <Route exact path='/about' component={About} />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
