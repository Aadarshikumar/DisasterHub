import React, { useState } from 'react';
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import AddAlertRoundedIcon from '@mui/icons-material/AddAlertRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import CorporateFareRoundedIcon from '@mui/icons-material/CorporateFareRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useRequests } from '../../context/RequestContext';
import { useAuth } from '../../context/AuthContext';

interface MobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSOSModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenSOSModal,
}) => {
  const { requests } = useRequests();
  const { currentUser } = useAuth();
  const [moreAnchorEl, setMoreAnchorEl] = useState<null | HTMLElement>(null);

  // Count active tasks for badge
  const activeTaskCount = requests.filter(
    (r) =>
      (r.requesterId === currentUser.id || r.assignedVolunteerId === currentUser.id) &&
      r.status !== 'FULFILLED' &&
      r.status !== 'CANCELLED'
  ).length;

  const handleOpenMore = (event: React.MouseEvent<HTMLElement>) => {
    setMoreAnchorEl(event.currentTarget);
  };

  const handleCloseMore = () => {
    setMoreAnchorEl(null);
  };

  const handleSelectMoreTab = (tab: string) => {
    onSelectTab(tab);
    handleCloseMore();
  };

  return (
    <>
      <Paper
        elevation={8}
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          borderTop: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(16px)',
          bgcolor: 'background.paper',
          pb: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <BottomNavigation
          value={['need-help', 'can-help', 'my-requests', 'admin'].includes(currentTab) ? currentTab : 'more'}
          onChange={(_, newValue) => {
            if (newValue === 'more') return;
            onSelectTab(newValue);
          }}
          showLabels
          sx={{
            height: 62,
            bgcolor: 'transparent',
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              px: 0.5,
              py: 0.8,
              '&.Mui-selected': {
                color: 'primary.main',
                '& .MuiBottomNavigationAction-label': {
                  fontWeight: 700,
                  fontSize: '0.72rem',
                },
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.68rem',
                fontWeight: 600,
              },
            },
          }}
        >
          <BottomNavigationAction
            value="need-help"
            label="Need Help"
            icon={<AddAlertRoundedIcon sx={{ fontSize: 22 }} />}
          />

          <BottomNavigationAction
            value="can-help"
            label="I Can Help"
            icon={<VolunteerActivismRoundedIcon sx={{ fontSize: 22 }} />}
          />

          <BottomNavigationAction
            value="my-requests"
            label="My Requests"
            icon={
              <Badge badgeContent={activeTaskCount} color="error" max={9}>
                <FormatListBulletedRoundedIcon sx={{ fontSize: 22 }} />
              </Badge>
            }
          />

          <BottomNavigationAction
            value="admin"
            label="Admin & Map"
            icon={<AdminPanelSettingsRoundedIcon sx={{ fontSize: 22 }} />}
          />

          <BottomNavigationAction
            value="more"
            label="More"
            icon={<MoreHorizRoundedIcon sx={{ fontSize: 22 }} />}
            onClick={handleOpenMore}
          />
        </BottomNavigation>
      </Paper>

      {/* More Options Mobile Menu */}
      <Menu
        anchorEl={moreAnchorEl}
        open={Boolean(moreAnchorEl)}
        onClose={handleCloseMore}
        transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        slotProps={{
          paper: {
            sx: { width: 240, borderRadius: 3, mb: 1, p: 0.5, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
          }
        }}
      >
        <MenuItem onClick={() => { onOpenSOSModal(); handleCloseMore(); }}>
          <ListItemIcon><WarningAmberRoundedIcon sx={{ color: 'error.main' }} fontSize="small" /></ListItemIcon>
          <ListItemText 
            primary={<Typography sx={{ fontWeight: 800, color: 'error.main', fontSize: '0.88rem' }}>SOS EMERGENCY</Typography>}
            secondary={<Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>1-Click Rapid Broadcast</Typography>}
          />
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={() => handleSelectMoreTab('org-hub')} selected={currentTab === 'org-hub'}>
          <ListItemIcon><CorporateFareRoundedIcon sx={{ color: '#4F46E5' }} fontSize="small" /></ListItemIcon>
          <ListItemText 
            primary={<Typography sx={{ fontWeight: 600, fontSize: '0.88rem' }}>NGO Relief Hub</Typography>}
            secondary={<Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Resource Inventories</Typography>}
          />
        </MenuItem>

        <MenuItem onClick={() => handleSelectMoreTab('admin')} selected={currentTab === 'admin'}>
          <ListItemIcon><AdminPanelSettingsRoundedIcon sx={{ color: '#DC2626' }} fontSize="small" /></ListItemIcon>
          <ListItemText 
            primary={<Typography sx={{ fontWeight: 600, fontSize: '0.88rem' }}>Admin Console</Typography>}
            secondary={<Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Moderation & Logs</Typography>}
          />
        </MenuItem>
      </Menu>
    </>
  );
};
