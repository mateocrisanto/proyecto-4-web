import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { mountContactApp } from '../react/contact/app.jsx';
import '../styles/contact.css';

window.React = React;
window.ReactDOM = ReactDOMClient;

mountContactApp();

