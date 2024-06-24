import React, { createContext, useState } from 'react';

const SearchContext = createContext();

const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const resetSearchTerm = () => {
    setSearchTerm('');
  };

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm, resetSearchTerm }}>
      {children}
    </SearchContext.Provider>
  );
};

export { SearchContext, SearchProvider }