import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import { OrganizationResource } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import { CategoryBadge } from '../../components/CategoryBadge/CategoryBadge';
import CorporateFareRoundedIcon from '@mui/icons-material/CorporateFareRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';

export const OrgDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { resources, requests, updateResourceStock } = useRequests();

  const [editModalItem, setEditModalItem] = useState<OrganizationResource | null>(null);
  const [newQty, setNewQty] = useState<number>(0);

  const openEditModal = (item: OrganizationResource) => {
    setEditModalItem(item);
    setNewQty(item.availableQuantity);
  };

  const handleSaveStock = async () => {
    if (editModalItem) {
      await updateResourceStock(editModalItem.id, Number(newQty));
      setEditModalItem(null);
    }
  };

  // Critical Requests needing bulk supply
  const pendingWaterNeeds = requests
    .filter((r) => r.category === 'water' && r.status === 'OPEN')
    .reduce((sum, r) => sum + r.peopleCount, 0);

  const pendingFoodNeeds = requests
    .filter((r) => r.category === 'food' && r.status === 'OPEN')
    .reduce((sum, r) => sum + r.peopleCount, 0);

  return (
    <Box>
      {/* Organization Header Banner */}
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          mb: 4,
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  bgcolor: 'secondary.light',
                  color: 'secondary.dark',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CorporateFareRoundedIcon />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Aman Disaster Relief Foundation
                  </Typography>
                  <Chip
                    icon={<VerifiedRoundedIcon sx={{ fontSize: '0.9rem !important' }} />}
                    label="VERIFIED NGO"
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Operational Hub: Central Relief Depot, New Delhi • Coverage: 15 km Radius
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Coordinating physical resource caches, bulk relief packages, and community volunteer dispatch units.
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main', display: 'block' }}>
                LIVE COMMUNITY DEFICIT
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                • Water: {pendingWaterNeeds} people awaiting supplies
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                • Food: {pendingFoodNeeds} people awaiting meal rations
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Inventory Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Relief Resource Inventory (Section 16 PRD)
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Real-time tracking of stockpiles available for field dispatch.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {resources.map((item) => {
          const pct = Math.round((item.availableQuantity / item.totalQuantity) * 100);
          const isLow = pct < 25;

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
              <Card sx={{ height: '100%', borderRadius: 3 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <CategoryBadge category={item.category} />
                    <IconButton size="small" onClick={() => openEditModal(item)} title="Update Stock">
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {item.resourceName}
                  </Typography>

                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                    Depot: {item.location.address}
                  </Typography>

                  {/* Stock Level Display */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: isLow ? 'error.main' : 'primary.main' }}>
                      {item.availableQuantity}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      of {item.totalQuantity} {item.unit}
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    color={isLow ? 'error' : pct < 50 ? 'warning' : 'primary'}
                    sx={{ height: 8, borderRadius: 4, mb: 1.5 }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={isLow ? 'CRITICAL STOCK' : `${pct}% Available`}
                      size="small"
                      color={isLow ? 'error' : 'default'}
                      sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => openEditModal(item)}
                      sx={{ fontSize: '0.75rem', py: 0.2 }}
                    >
                      Update Qty
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Edit Stock Level Dialog */}
      <Dialog open={Boolean(editModalItem)} onClose={() => setEditModalItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Update Resource Stock</DialogTitle>
        <DialogContent>
          {editModalItem && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                {editModalItem.resourceName}
              </Typography>
              <TextField
                fullWidth
                type="number"
                label={`Available Quantity (${editModalItem.unit})`}
                value={newQty}
                onChange={(e) => setNewQty(Math.max(0, parseInt(e.target.value) || 0))}
                helperText={`Total capacity: ${editModalItem.totalQuantity} ${editModalItem.unit}`}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditModalItem(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveStock}>
            Save Stock Level
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
