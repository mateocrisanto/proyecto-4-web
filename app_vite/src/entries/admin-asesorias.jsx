import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { mountAdminAsesoriasApp } from '../react/admin-asesorias/app.jsx';
import '../styles/admin-asesorias.css';

window.React = React;
window.ReactDOM = ReactDOMClient;

mountAdminAsesoriasApp();

