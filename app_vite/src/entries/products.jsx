import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { mountProductsApp } from '../react/products/app.jsx';
import '../styles/products.css';

window.React = React;
window.ReactDOM = ReactDOMClient;

mountProductsApp();

