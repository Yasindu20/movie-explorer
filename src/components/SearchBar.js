import React, { useState, useEffect } from 'react';
import { Paper, InputBase, IconButton } from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { useMovieContext } from '../context/MovieContext';
import { useNavigate, useLocation } from 'react-router-dom';

const SearchBar = () => {
  const { searchQuery, searchForMovies, resetSearch } = useMovieContext();
  const [inputValue, setInputValue] = useState(searchQuery || '');
  const navigate = useNavigate();
  const location = useLocation();

  // Update input value when searchQuery changes
  useEffect(() => {
    setInputValue(searchQuery || '');
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      searchForMovies(inputValue.trim());
      
      // Navigate to search results page if not already there
      if (location.pathname !== '/search') {
        navigate('/search');
      }
    }
  };

  const handleClear = () => {
    setInputValue('');
    resetSearch();
    
    // Navigate to home if on search page
    if (location.pathname === '/search') {
      navigate('/');
    }
  };

  return (
    <Paper
      component="form"
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: 600,
        mx: 'auto',
        borderRadius: 2,
        boxShadow: 2
      }}
      elevation={3}
      onSubmit={handleSearch}
    >
      <IconButton sx={{ p: '10px' }} aria-label="search">
        <Search />
      </IconButton>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search for movies..."
        inputProps={{ 'aria-label': 'search movies' }}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      {inputValue && (
        <IconButton 
          sx={{ p: '10px' }} 
          aria-label="clear search" 
          onClick={handleClear}
        >
          <Clear />
        </IconButton>
      )}
    </Paper>
  );
};

export default SearchBar;