import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Switch,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Badge
} from '@mui/material';
import {
  DarkMode,
  LightMode,
  AccountCircle,
  MovieFilter,
  Home,
  Favorite,
  Menu as MenuIcon,
  Logout,
  Recommend,
  Article,
  PlaylistPlay
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMovieContext } from '../context/MovieContext';
import { MoodOutlined } from '@mui/icons-material';
import { useRecommendation } from '../context/RecommendationContext';
import { alpha } from '@mui/material/styles';

const Header = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useMovieContext();
  const { watchHistory } = useRecommendation();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State for user menu
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  // State for mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Handle user menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle user menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle logout
  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  // Toggle drawer
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  // Check if a path is active
  const isPathActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Navigation links - UPDATED with Blog and Lists
  const navLinks = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Recommendations', icon: <Recommend />, path: '/recommendations', badge: watchHistory.length > 0 },
    { text: 'Moods', icon: <MoodOutlined />, path: '/moods' },
    { text: 'Blog', icon: <Article />, path: '/blog' },
    { text: 'Lists', icon: <PlaylistPlay />, path: '/lists' },
    { text: 'Favorites', icon: <Favorite />, path: '/favorites' },
  ];

  // Mobile drawer content
  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <MovieFilter sx={{ mr: 1 }} />
        <Typography variant="h6">Movie Explorer</Typography>
      </Box>
      <Divider />
      <List>
        {navLinks.map((link) => (
          <ListItem
            button
            key={link.text}
            component={RouterLink}
            to={link.path}
            selected={isPathActive(link.path)}
            sx={{
              bgcolor: isPathActive(link.path) ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              '&:hover': {
                bgcolor: isPathActive(link.path) ? alpha(theme.palette.primary.main, 0.15) : 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <ListItemIcon>
              {link.badge ? (
                <Badge color="error" variant="dot" invisible={!link.badge}>
                  {link.icon}
                </Badge>
              ) : (
                link.icon
              )}
            </ListItemIcon>
            <ListItemText primary={link.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem>
          <ListItemIcon>
            {darkMode ? <DarkMode /> : <LightMode />}
          </ListItemIcon>
          <ListItemText primary="Dark Mode" />
          <Switch
            checked={darkMode}
            onChange={toggleDarkMode}
            color="primary"
          />
        </ListItem>
        {user && (
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky">
      <Toolbar>
        {isMobile && user && (
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo and App Name */}
        <MovieFilter sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            mr: 2,
            flexGrow: { xs: 1, md: 0 }
          }}
        >
          Movie Explorer
        </Typography>

        {/* Navigation links for medium screens and up */}
        {!isMobile && user && (
          <Box sx={{ flexGrow: 1, display: 'flex' }}>
            {navLinks.map((link) => (
              <Button
                key={link.text}
                color="inherit"
                component={RouterLink}
                to={link.path}
                startIcon={
                  link.badge ? (
                    <Badge color="error" variant="dot" invisible={!link.badge}>
                      {link.icon}
                    </Badge>
                  ) : (
                    link.icon
                  )
                }
                sx={{
                  mx: 0.5,
                  borderRadius: 2,
                  px: 2,
                  bgcolor: isPathActive(link.path) ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  '&:hover': {
                    bgcolor: isPathActive(link.path) ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)'
                  }
                }}
              >
                {link.text}
              </Button>
            ))}
          </Box>
        )}

        {/* Dark mode toggle */}
        {!isMobile && (
          <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <IconButton color="inherit" onClick={toggleDarkMode}>
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
        )}

        {/* User menu */}
        {user ? (
          <>
            {!isMobile && (
              <Box sx={{ ml: 2 }}>
                <Tooltip title="Account settings">
                  <IconButton
                    onClick={handleMenuOpen}
                    size="small"
                    edge="end"
                    aria-controls={openMenu ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={openMenu ? 'true' : undefined}
                    color="inherit"
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>
                      {user.name.charAt(0)}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            <Menu
              id="account-menu"
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              MenuListProps={{
                'aria-labelledby': 'user-button',
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem disabled>
                <Typography variant="body2">{user.name}</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            color="inherit"
            component={RouterLink}
            to="/login"
            startIcon={<AccountCircle />}
          >
            Login
          </Button>
        )}
      </Toolbar>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawerContent}
      </Drawer>
    </AppBar>
  );
};

export default Header;