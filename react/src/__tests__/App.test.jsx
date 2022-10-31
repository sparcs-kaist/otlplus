import React from 'react';
import { render } from '@testing-library/react';
// import App from '../App';
import TestPage from '../pages/TestPage';

it('renders without crashing', () => {
  // render(<App />);
});

it('renders TestPage', () => {
  render(<TestPage />);
});
