'use client';

import ReactDOM from 'react-dom';

export default function HomePreloadResources() {
  ReactDOM.preload('/hero.jpg', { as: 'image' });
  ReactDOM.preload('/fonts/Belleza-Regular.ttf', {
    as: 'font',
    type: 'font/ttf',
    crossOrigin: 'anonymous',
  });

  return null;
}
