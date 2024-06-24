import React, { createContext, useState } from 'react';

const SearchContext = createContext();

const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupC, setgrupC] =useState('');

  const resetSearchTerm = () => {
    setSearchTerm('');
  };

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm, resetSearchTerm, groupC, setgrupC }}>
      {children}
    </SearchContext.Provider>
  );
};

export { SearchContext, SearchProvider }