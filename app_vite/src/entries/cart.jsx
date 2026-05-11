import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { mountCartApp } from '../react/cart/app.jsx';
import '../styles/cart.css';

window.React = React;
window.ReactDOM = ReactDOMClient;

mountCartApp();

