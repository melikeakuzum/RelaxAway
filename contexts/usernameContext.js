// UsernameContext.js
import React, { createContext, useState, useContext } from 'react';

const UsernameContext = createContext();

export const setUsername = (username) => {
  setUsername(username);
};

export const useUsername = () => useContext(UsernameContext);

export const UsernameProvider = ({ children }) => {
  const [username, setUsername] = useState('');

  return (
    <UsernameContext.Provider value={{ username, setUsername }}>
      {children}
    </UsernameContext.Provider>
  );
};
