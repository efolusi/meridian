import React from 'react';

const DirectionContext = React.createContext(undefined);

/** Supply reading direction to components whose keyboard behavior must mirror. */
export function DirectionProvider({ direction = 'ltr', children }) {
  const value = direction === 'rtl' ? 'rtl' : 'ltr';
  return <DirectionContext.Provider value={value}>{children}</DirectionContext.Provider>;
}

/** Read the nearest provider, falling back to the document direction. */
export function useDirection() {
  const provided = React.useContext(DirectionContext);
  if (provided) return provided;
  if (typeof document !== 'undefined' && document.documentElement.dir === 'rtl') return 'rtl';
  return 'ltr';
}
