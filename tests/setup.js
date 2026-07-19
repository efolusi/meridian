// Components are compiled into a bundle where bare imports are stripped and
// React / ReactDOM are read off the window. Portal.jsx relies on that for
// ReactDOM.createPortal, so the globals have to exist here too.
import React from 'react';
import ReactDOM from 'react-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

globalThis.React = React;
globalThis.ReactDOM = ReactDOM;

afterEach(() => cleanup());
