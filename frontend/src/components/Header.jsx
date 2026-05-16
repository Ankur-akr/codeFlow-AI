import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
} from '@mui/material';
import { Dashboard as DashboardIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { logout } from '../store/slices/authSlice';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await dispatch(logout());
    handleClose();
    navigate('/');
  };

  const handleDashboard = () => {
    handleClose();
    navigate('/dashboard');
  };

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            flexGrow: 1,
          }}
          onClick={() => navigate('/dashboard')}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 700, color: 'white' }}
          >
            CodeFlow AI
          </Typography>
          <Typography
            variant="caption"
            sx={{ ml: 1, color: 'rgba(255,255,255,0.7)' }}
          >
            powered by IBM Bob
          </Typography>
        </Box>

        <Button
          color="inherit"
          startIcon={<DashboardIcon />}
          onClick={handleDashboard}
          sx={{ mr: 2 }}
        >
          Dashboard
        </Button>

        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
          color="inherit"
        >
          <Avatar
            alt={user?.username}
            src={user?.avatarUrl}
            sx={{ width: 32, height: 32 }}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleDashboard}>
            <DashboardIcon sx={{ mr: 1 }} fontSize="small" />
            Dashboard
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Header;

// Made with Bob
