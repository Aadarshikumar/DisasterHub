import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  useTheme,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useRequests } from '../../context/RequestContext';
import { UserRole } from '../../types';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import Brightness4RoundedIcon from '@mui/icons-material/Brightness4Rounded';
import Brightness7RoundedIcon from '@mui/icons-material/Brightness7Rounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import CorporateFareRoundedIcon from '@mui/icons-material/CorporateFareRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import AddAlertRoundedIcon from '@mui/icons-material/AddAlertRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import { api } from '../../services/api';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSOSModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTab, onOpenSOSModal }) => {
  const theme = useTheme();
  const { currentUser, activeRole, switchRole, themeMode, toggleThemeMode } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, showToast } = useNotifications();
  const { requests } = useRequests();

  // Count active requests created by the current user
  const activeMyRequestsCount = requests.filter(
    (r) => r.requesterId === currentUser.id && r.status !== 'FULFILLED' && r.status !== 'CANCELLED'
  ).length;

  // Role Switcher Menu State
  const [roleAnchorEl, setRoleAnchorEl] = useState<null | HTMLElement>(null);
  // Notifications Menu State
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenRoleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setRoleAnchorEl(event.currentTarget);
  };
  const handleCloseRoleMenu = () => {
    setRoleAnchorEl(null);
  };

  const handleSelectRole = (role: UserRole) => {
    switchRole(role);
    handleCloseRoleMenu();
    showToast(`Switched active persona to ${role}`, 'info');
  };

  const handleOpenNotifMenu = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };
  const handleCloseNotifMenu = () => {
    setNotifAnchorEl(null);
  };

  const handleResetData = () => {
    api.resetData();
    window.location.reload();
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'VOLUNTEER': return <VolunteerActivismRoundedIcon fontSize="small" sx={{ color: '#059669' }} />;
      case 'ORGANIZATION': return <CorporateFareRoundedIcon fontSize="small" sx={{ color: '#4F46E5' }} />;
      case 'ADMIN': return <AdminPanelSettingsRoundedIcon fontSize="small" sx={{ color: '#DC2626' }} />;
      default: return <PersonOutlineRoundedIcon fontSize="small" sx={{ color: '#0284C7' }} />;
    }
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.5, md: 3 }, py: 0.7 }}>
        
        {/* Left: Brand & Emergency SOS */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
          <Box 
            onClick={() => onSelectTab('need-help')} 
            sx={{ display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer' }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.35)',
              }}
            >
              <WarningAmberRoundedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 800, 
                  letterSpacing: '-0.02em', 
                  lineHeight: 1.1,
                  background: themeMode === 'dark' ? 'linear-gradient(90deg, #FFFFFF, #93C5FD)' : 'linear-gradient(90deg, #0F172A, #0284C7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                DisasterAid
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.72rem' }}>
                COMMUNITY AID HUB
              </Typography>
            </Box>
          </Box>

          {/* Quick SOS Trigger Button */}
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={onOpenSOSModal}
            startIcon={<WarningAmberRoundedIcon />}
            sx={{
              ml: { xs: 0.5, md: 1 },
              px: { xs: 1.5, md: 2 },
              py: 0.6,
              fontWeight: 800,
              fontSize: '0.82rem',
              letterSpacing: '0.04em',
              display: { xs: 'none', sm: 'inline-flex' },
            }}
          >
            SOS EMERGENCY
          </Button>
        </Box>

        {/* Center: Main Navigation Tabs (Visible on MD and up) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
          <Button
            variant={currentTab === 'need-help' ? 'contained' : 'text'}
            color={currentTab === 'need-help' ? 'primary' : 'inherit'}
            onClick={() => onSelectTab('need-help')}
            startIcon={<AddAlertRoundedIcon />}
            size="small"
          >
            I Need Help
          </Button>

          <Button
            variant={currentTab === 'can-help' ? 'contained' : 'text'}
            color={currentTab === 'can-help' ? 'primary' : 'inherit'}
            onClick={() => onSelectTab('can-help')}
            startIcon={<VolunteerActivismRoundedIcon />}
            size="small"
          >
            I Can Help
          </Button>

          <Badge
            badgeContent={activeMyRequestsCount}
            color="error"
            max={9}
            sx={{
              '& .MuiBadge-badge': {
                right: 4,
                top: 4,
                fontSize: '0.68rem',
                height: 18,
                minWidth: 18,
                fontWeight: 800,
              }
            }}
          >
            <Button
              variant={currentTab === 'my-requests' ? 'contained' : 'text'}
              color={currentTab === 'my-requests' ? 'primary' : 'inherit'}
              onClick={() => onSelectTab('my-requests')}
              startIcon={<FormatListBulletedRoundedIcon />}
              size="small"
            >
              My Requests
            </Button>
          </Badge>

          <Button
            variant={currentTab === 'org-hub' ? 'contained' : 'text'}
            color={currentTab === 'org-hub' ? 'primary' : 'inherit'}
            onClick={() => onSelectTab('org-hub')}
            startIcon={<CorporateFareRoundedIcon />}
            size="small"
          >
            NGO Hub
          </Button>

          <Button
            variant={currentTab === 'admin' ? 'contained' : 'text'}
            color={currentTab === 'admin' ? 'primary' : 'inherit'}
            onClick={() => onSelectTab('admin')}
            startIcon={<AdminPanelSettingsRoundedIcon />}
            size="small"
          >
            Admin & Map
          </Button>
        </Box>

        {/* Right: Role Switcher, Notifications, Theme Mode */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 } }}>
          
          {/* Active Persona / Role Switcher */}
          <Tooltip title="Switch Demo Persona / Role">
            <Button
              onClick={handleOpenRoleMenu}
              variant="outlined"
              size="small"
              sx={{
                px: { xs: 1, sm: 1.5 },
                py: 0.4,
                borderColor: 'divider',
                color: 'text.primary',
                bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                minWidth: 'auto',
              }}
            >
              {getRoleIcon(activeRole)}
              <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, fontSize: '0.68rem', color: 'primary.main', lineHeight: 1 }}>
                  ROLE: {activeRole}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', lineHeight: 1.2 }}>
                  {currentUser.name.split(' ')[0]}
                </Typography>
              </Box>
            </Button>
          </Tooltip>

          {/* Role Selection Dropdown Menu */}
          <Menu
            anchorEl={roleAnchorEl}
            open={Boolean(roleAnchorEl)}
            onClose={handleCloseRoleMenu}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                sx: { width: 260, borderRadius: 3, mt: 1.5, p: 1, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' },
              }
            }}
          >
            <Typography variant="caption" sx={{ px: 2, py: 1, fontWeight: 700, color: 'text.secondary', display: 'block' }}>
              SWITCH SIMULATED PERSONA
            </Typography>

            <MenuItem selected={activeRole === 'REQUESTER'} onClick={() => handleSelectRole('REQUESTER')}>
              <ListItemIcon><PersonOutlineRoundedIcon fontSize="small" sx={{ color: '#0284C7' }} /></ListItemIcon>
              <ListItemText 
                primary={<Typography sx={{ fontWeight: 600, fontSize: '0.88rem' }}>Priya Sharma (Requester)</Typography>}
                secondary={<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Needs drinking water / shelter</Typography>}
              />
            </MenuItem>

            <MenuItem selected={activeRole === 'VOLUNTEER'} onClick={() => handleSelectRole('VOLUNTEER')}>
              <ListItemIcon><VolunteerActivismRoundedIcon fontSize="small" sx={{ color: '#059669' }} /></ListItemIcon>
              <ListItemText 
                primary={<Typography sx={{ fontWeight: 600, fontSize: '0.88rem' }}>Rahul Verma (Volunteer)</Typography>}
                secondary={<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>4x4 Driver with water & rations</Typography>}
              />
            </MenuItem>

            <MenuItem selected={activeRole === 'ORGANIZATION'} onClick={() => handleSelectRole('ORGANIZATION')}>
              <ListItemIcon><CorporateFareRoundedIcon fontSize="small" sx={{ color: '#4F46E5' }} /></ListItemIcon>
              <ListItemText 
                primary={<Typography sx={{ fontWeight: 600, fontSize: '0.88rem' }}>Aman Relief (NGO)</Typography>}
                secondary={<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Inventory & volunteer fleet</Typography>}
              />
            </MenuItem>

            <MenuItem selected={activeRole === 'ADMIN'} onClick={() => handleSelectRole('ADMIN')}>
              <ListItemIcon><AdminPanelSettingsRoundedIcon fontSize="small" sx={{ color: '#DC2626' }} /></ListItemIcon>
              <ListItemText 
                primary={<Typography sx={{ fontWeight: 600, fontSize: '0.88rem' }}>Crisis Admin</Typography>}
                secondary={<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Platform oversight & audit logs</Typography>}
              />
            </MenuItem>

            <Divider sx={{ my: 1 }} />

            <MenuItem onClick={handleResetData}>
              <ListItemIcon><RestartAltRoundedIcon fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary={<Typography sx={{ fontSize: '0.82rem', color: 'error.main', fontWeight: 600 }}>Reset Seed Data</Typography>}
                secondary={<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Restore initial test requests</Typography>}
              />
            </MenuItem>
          </Menu>

          {/* Notifications Bell */}
          <Tooltip title="Real-time Crisis Alerts">
            <IconButton onClick={handleOpenNotifMenu} size="small" sx={{ color: 'text.primary' }}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsRoundedIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Notifications Dropdown */}
          <Menu
            anchorEl={notifAnchorEl}
            open={Boolean(notifAnchorEl)}
            onClose={handleCloseNotifMenu}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                sx: { width: { xs: 290, sm: 340 }, maxHeight: 420, borderRadius: 3, mt: 1.5, p: 0.5 },
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Live Notifications ({notifications.length})
              </Typography>
              {unreadCount > 0 && (
                <Button size="small" onClick={markAllAsRead} sx={{ fontSize: '0.75rem', py: 0 }}>
                  Mark all read
                </Button>
              )}
            </Box>
            <Divider />

            {notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                <CheckCircleOutlineRoundedIcon sx={{ fontSize: 32, mb: 1, opacity: 0.6 }} />
                <Typography variant="body2">No notifications right now.</Typography>
              </Box>
            ) : (
              notifications.map((n) => (
                <MenuItem 
                  key={n.id} 
                  onClick={() => { markAsRead(n.id); handleCloseNotifMenu(); }}
                  sx={{ 
                    whiteSpace: 'normal', 
                    py: 1.2, 
                    px: 2,
                    bgcolor: n.isRead ? 'transparent' : 'action.hover',
                    borderLeft: n.isRead ? 'none' : '3px solid #0284C7',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: n.isRead ? 500 : 700, fontSize: '0.85rem' }}>
                      {n.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                      {n.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.68rem', mt: 0.5, display: 'block' }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Menu>

          {/* Theme Mode Toggle (Dark / Light) */}
          <Tooltip title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton onClick={toggleThemeMode} size="small" sx={{ color: 'text.primary' }}>
              {themeMode === 'dark' ? <Brightness7RoundedIcon /> : <Brightness4RoundedIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
