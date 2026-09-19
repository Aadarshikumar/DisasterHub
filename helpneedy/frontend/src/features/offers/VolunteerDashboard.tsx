import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton,
  Tabs,
  Tab,
  Divider,
  Stack,
  TextField,
  InputAdornment,
  useTheme,
} from '@mui/material';
import { HelpRequest, HelpCategory } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import { useNotifications } from '../../context/NotificationContext';
import { api, calculateDistanceKm } from '../../services/api';
import { CategoryBadge } from '../../components/CategoryBadge/CategoryBadge';
import { UrgencyChip } from '../../components/UrgencyChip/UrgencyChip';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { RequestStatusTracker } from '../requests/RequestStatusTracker';

// Icons
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import NearMeRoundedIcon from '@mui/icons-material/NearMeRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CorporateFareRoundedIcon from '@mui/icons-material/CorporateFareRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

interface VolunteerDashboardProps {
  onOpenOfferForm: () => void;
  onNavigateToMap: (requestId?: string) => void;
  onNavigateToTasks: () => void;
}

const allCategories: { id: HelpCategory; label: string }[] = [
  { id: 'water', label: '💧 Water' },
  { id: 'food', label: '🍲 Food & Rations' },
  { id: 'medicine', label: '💊 Medicines' },
  { id: 'medical_assistance', label: '🩺 Medical Aid' },
  { id: 'shelter', label: '⛺ Shelter / Tarps' },
  { id: 'evacuation', label: '🚨 Rescue / Evac' },
  { id: 'power', label: '⚡ Power / Solar' },
  { id: 'other', label: '📦 General Aid' },
];

const radiusOptions = [1, 3, 5, 10, 25, 50];

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({
  onOpenOfferForm,
  onNavigateToMap,
  onNavigateToTasks,
}) => {
  const theme = useTheme();
  const { currentUser, activeRole } = useAuth();
  const { requests, offers, acceptRequest, markRequestFulfilled, refreshData } = useRequests();
  const { showToast } = useNotifications();

  // Find this volunteer's active offer or fallback
  const myOffer = offers.find((o) => o.volunteerId === currentUser.id) || offers[0];

  // Helper Location
  const helperLocation = useMemo(() => {
    return currentUser.location || { latitude: 28.6150, longitude: 77.2100, address: 'Central Hub, Connaught Place' };
  }, [currentUser]);

  // Interactive Radius & Category Filter State
  const [serviceRadius, setServiceRadius] = useState<number>(myOffer?.serviceRadiusKm || 10);
  const [selectedCategories, setSelectedCategories] = useState<HelpCategory[]>(
    myOffer?.categories?.length ? myOffer.categories : ['water', 'food', 'medicine', 'medical_assistance', 'shelter', 'power']
  );

  // Active Subsection Tab: 'remaining' | 'in_progress'
  const [activeSubTab, setActiveSubTab] = useState<'remaining' | 'in_progress'>('remaining');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Toggle Category selection
  const handleToggleCategory = (cat: HelpCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat)
        ? prev.length > 1
          ? prev.filter((c) => c !== cat)
          : prev // keep at least 1
        : [...prev, cat]
    );
  };

  // ----------------------------------------------------
  // 1. Calculate Incoming Matching Requests (Remaining Requests)
  // ----------------------------------------------------
  const remainingMatchingRequests = useMemo(() => {
    const openRequests = requests.filter((r) => r.status === 'OPEN');

    const scored = openRequests
      .map((req) => {
        const distance = calculateDistanceKm(
          helperLocation.latitude,
          helperLocation.longitude,
          req.location.latitude,
          req.location.longitude
        );

        let score = 0;
        const hasCategory = selectedCategories.includes(req.category);
        if (hasCategory) score += 50;

        if (distance <= 1) score += 30;
        else if (distance <= 3) score += 20;
        else if (distance <= 5) score += 10;

        if (req.urgency === 'critical') score += 25;
        else if (req.urgency === 'urgent') score += 15;

        return {
          ...req,
          distanceKm: distance,
          matchedScore: score,
        };
      })
      .filter((r) => {
        const withinRadius = (r.distanceKm || 0) <= serviceRadius;
        const matchesCategory = selectedCategories.includes(r.category);
        const matchesSearch = searchQuery.trim()
          ? r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.location.landmark || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.location.address || '').toLowerCase().includes(searchQuery.toLowerCase())
          : true;

        return withinRadius && matchesCategory && matchesSearch;
      })
      .sort((a, b) => (b.matchedScore || 0) - (a.matchedScore || 0));

    return scored;
  }, [requests, helperLocation, serviceRadius, selectedCategories, searchQuery]);

  // ----------------------------------------------------
  // 2. Calculate Work in Progress Requests
  // ----------------------------------------------------
  const workInProgressRequests = useMemo(() => {
    return requests
      .filter(
        (r) =>
          (r.assignedVolunteerId === currentUser.id || r.assignedVolunteerName === currentUser.name) &&
          (r.status === 'MATCHED' || r.status === 'IN_PROGRESS')
      )
      .map((req) => {
        const distance = calculateDistanceKm(
          helperLocation.latitude,
          helperLocation.longitude,
          req.location.latitude,
          req.location.longitude
        );
        return {
          ...req,
          distanceKm: distance,
        };
      })
      .filter((r) => {
        if (!searchQuery.trim()) return true;
        return (
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.location.landmark || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
  }, [requests, currentUser, helperLocation, searchQuery]);

  // ----------------------------------------------------
  // Action Handlers
  // ----------------------------------------------------

  // Accept request -> Automatically moves to Work in Progress
  const handleAcceptRequest = async (requestId: string) => {
    setAcceptingId(requestId);
    try {
      await acceptRequest(requestId);
      await refreshData();
      showToast(`Request #${requestId} accepted! Moved to "Work in Progress".`, 'success');
      // Switch view to Work in Progress to show newly accepted task
      setActiveSubTab('in_progress');
    } catch (e) {
      showToast('Failed to accept request', 'error');
    } finally {
      setAcceptingId(null);
    }
  };

  // Start Delivery / In Transit
  const handleStartTransit = async (requestId: string) => {
    setUpdatingId(requestId);
    try {
      await api.requests.setInProgress(requestId);
      await refreshData();
      showToast(`Request #${requestId} marked IN TRANSIT! En route to requester.`, 'info');
    } catch (e) {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Mark Fulfilled
  const handleFulfillMission = async (requestId: string) => {
    setUpdatingId(requestId);
    try {
      await markRequestFulfilled(requestId);
      await refreshData();
      showToast(`Mission #${requestId} fulfilled successfully! Great work!`, 'success');
    } catch (e) {
      showToast('Failed to fulfill request', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* ---------------------------------------------------- */}
      {/* 1. Organization & Service Area Configuration Banner */}
      {/* ---------------------------------------------------- */}
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 3.5,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}
      >
        <Grid container spacing={2.5} sx={{ alignItems: 'center' }}>
          {/* Organization / Volunteer Identity */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: activeRole === 'ORGANIZATION' ? 'secondary.main' : 'success.main',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                }}
              >
                {activeRole === 'ORGANIZATION' ? <CorporateFareRoundedIcon /> : <VolunteerActivismRoundedIcon />}
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {currentUser.organizationName || currentUser.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnRoundedIcon fontSize="inherit" color="action" />
                  Base Location: <strong>{helperLocation.address || 'New Delhi Central'}</strong>
                </Typography>
              </Box>
            </Box>

            {/* Supported Needs Category Toggles */}
            <Box sx={{ mt: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.8, textTransform: 'uppercase' }}>
                Supported Needs / Aid Categories (Click to toggle):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {allCategories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <Chip
                      key={cat.id}
                      label={cat.label}
                      size="small"
                      clickable
                      color={isSelected ? 'primary' : 'default'}
                      variant={isSelected ? 'filled' : 'outlined'}
                      onClick={() => handleToggleCategory(cat.id)}
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          </Grid>

          {/* Service Radius Selector */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(248, 250, 252, 0.8)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
                  Coverage Radius: <strong style={{ color: '#0284C7' }}>{serviceRadius} km</strong>
                </Typography>

                <Tooltip title="Refresh Incoming Matches">
                  <IconButton size="small" onClick={() => refreshData()}>
                    <RefreshRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {radiusOptions.map((r) => (
                  <Chip
                    key={r}
                    label={`${r} km`}
                    size="small"
                    clickable
                    color={serviceRadius === r ? 'info' : 'default'}
                    variant={serviceRadius === r ? 'filled' : 'outlined'}
                    onClick={() => setServiceRadius(r)}
                    sx={{
                      fontWeight: 800,
                      minWidth: 54,
                      fontSize: '0.75rem',
                    }}
                  />
                ))}
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1, fontSize: '0.72rem' }}>
                Only matching requests within <strong>{serviceRadius} km</strong> for selected categories will be shown.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* ---------------------------------------------------- */}
      {/* 2. Subsection Switcher: Remaining Requests vs Work in Progress */}
      {/* ---------------------------------------------------- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
        {/* Navigation Tabs */}
        <Paper sx={{ borderRadius: 3, bgcolor: 'background.paper' }}>
          <Tabs
            value={activeSubTab}
            onChange={(_, v) => setActiveSubTab(v)}
            textColor="primary"
            indicatorColor="primary"
            sx={{ px: 1, minHeight: 48 }}
          >
            <Tab
              value="remaining"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>📥 Remaining Requests</span>
                  <Chip
                    size="small"
                    label={remainingMatchingRequests.length}
                    color={activeSubTab === 'remaining' ? 'primary' : 'default'}
                    sx={{ height: 20, fontSize: '0.72rem', fontWeight: 800 }}
                  />
                </Box>
              }
              sx={{ fontWeight: 800, textTransform: 'none', py: 1 }}
            />

            <Tab
              value="in_progress"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>🚚 Work in Progress</span>
                  <Chip
                    size="small"
                    label={workInProgressRequests.length}
                    color={workInProgressRequests.length > 0 ? 'warning' : 'default'}
                    sx={{ height: 20, fontSize: '0.72rem', fontWeight: 800 }}
                  />
                </Box>
              }
              sx={{ fontWeight: 800, textTransform: 'none', py: 1 }}
            />
          </Tabs>
        </Paper>

        {/* Search Bar */}
        <TextField
          size="small"
          placeholder="Search requests by title, landmark..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: { xs: '100%', sm: 280 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }
          }}
        />
      </Box>

      {/* ---------------------------------------------------- */}
      {/* 3. Sub-section A: Remaining Requests (Incoming Matches) */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'remaining' && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Incoming Requests Matching Your Needs ({remainingMatchingRequests.length})
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Ranked by category match (+50 pts), proximity (+30 pts), and urgency.
            </Typography>
          </Box>

          {remainingMatchingRequests.length === 0 ? (
            <Paper variant="outlined" sx={{ p: { xs: 4, md: 6 }, textAlign: 'center', borderRadius: 3.5 }}>
              <PendingActionsRoundedIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 1, opacity: 0.6 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                No Matching Incoming Requests
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 460, mx: 'auto', mb: 2 }}>
                No open aid requests found within <strong>{serviceRadius} km</strong> for your selected categories.
                Try widening your coverage radius or enabling more aid categories above.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2.5}>
              {remainingMatchingRequests.map((req) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={req.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3.5,
                      border: req.urgency === 'critical' ? '2px solid #EF4444' : '1px solid',
                      borderColor: req.urgency === 'critical' ? 'error.main' : 'divider',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Top Bar: Urgency, Category, Distance & Match Score */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                          <UrgencyChip urgency={req.urgency} size="small" />
                          <CategoryBadge category={req.category} />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          {/* Distance Pill */}
                          <Chip
                            icon={<NearMeRoundedIcon sx={{ fontSize: '0.85rem !important' }} />}
                            label={`${req.distanceKm} km`}
                            size="small"
                            sx={{ fontWeight: 700, bgcolor: 'action.hover', height: 22, fontSize: '0.72rem' }}
                          />

                          {/* Match Score Badge */}
                          <Tooltip title={`Match Score: ${req.matchedScore} pts (+50 category, proximity & urgency score)`}>
                            <Chip
                              label={`${req.matchedScore} pts`}
                              size="small"
                              color={req.matchedScore && req.matchedScore >= 70 ? 'success' : 'primary'}
                              sx={{ fontWeight: 800, fontSize: '0.7rem', height: 22 }}
                            />
                          </Tooltip>
                        </Box>
                      </Box>

                      {/* Title & Description */}
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.8, fontSize: '1.02rem', lineHeight: 1.3 }}>
                        {req.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          mb: 2,
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {req.description}
                      </Typography>

                      {/* Location & People in Need info */}
                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'background.default', mb: 2, mt: 'auto' }}>
                        <Grid container spacing={0.8}>
                          <Grid size={{ xs: 12 }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOnRoundedIcon fontSize="small" sx={{ color: 'primary.main', flexShrink: 0 }} />
                            <Typography noWrap variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {req.location.address}
                              {req.location.landmark && ` (Near ${req.location.landmark})`}
                            </Typography>
                          </Grid>

                          <Grid size={{ xs: 12 }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PeopleAltRoundedIcon fontSize="small" sx={{ color: 'text.secondary', flexShrink: 0 }} />
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                              {req.peopleCount} {req.peopleCount > 1 ? 'People' : 'Person'} Needing Support
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>

                      {/* Accept Request Button */}
                      <Box sx={{ display: 'flex', gap: 1.2, mt: 'auto' }}>
                        <Button
                          variant="contained"
                          color={req.urgency === 'critical' ? 'error' : 'primary'}
                          fullWidth
                          disabled={acceptingId === req.id}
                          onClick={() => handleAcceptRequest(req.id)}
                          startIcon={acceptingId === req.id ? <CircularProgress size={16} color="inherit" /> : <HandshakeRoundedIcon />}
                          sx={{ fontWeight: 800 }}
                        >
                          {acceptingId === req.id ? 'Accepting...' : 'ACCEPT REQUEST'}
                        </Button>

                        <Button
                          variant="outlined"
                          onClick={() => onNavigateToMap(req.id)}
                          startIcon={<MapRoundedIcon />}
                          sx={{ minWidth: 'auto', px: 1.8 }}
                        >
                          Map
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. Sub-section B: Work in Progress (Accepted Requests) */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'in_progress' && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Requests Currently in Progress ({workInProgressRequests.length})
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Coordinate delivery, call the requester, and advance status to fulfilled.
            </Typography>
          </Box>

          {workInProgressRequests.length === 0 ? (
            <Paper variant="outlined" sx={{ p: { xs: 4, md: 6 }, textAlign: 'center', borderRadius: 3.5 }}>
              <LocalShippingRoundedIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 1, opacity: 0.6 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                No Requests Currently in Progress
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 460, mx: 'auto', mb: 2.5 }}>
                You have not accepted any active aid missions yet. Switch to the <strong>“Remaining Requests”</strong> tab to accept incoming matches!
              </Typography>
              <Button
                variant="contained"
                onClick={() => setActiveSubTab('remaining')}
                startIcon={<ArrowForwardRoundedIcon />}
                sx={{ fontWeight: 700 }}
              >
                View Incoming Matching Requests
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2.5}>
              {workInProgressRequests.map((req) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={req.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3.5,
                      border: req.status === 'IN_PROGRESS' ? '2px solid #0284C7' : '1.5px solid #F59E0B',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    }}
                  >
                    <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Top Bar: Reference ID, Status Badge, Urgency */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontWeight: 800,
                              color: 'primary.main',
                              bgcolor: 'primary.light',
                              px: 0.8,
                              py: 0.2,
                              borderRadius: 1,
                            }}
                          >
                            #{req.id}
                          </Typography>
                          <CategoryBadge category={req.category} />
                        </Box>
                        <StatusBadge status={req.status} />
                      </Box>

                      {/* Title */}
                      <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.02rem', mb: 1, lineHeight: 1.3 }}>
                        {req.title}
                      </Typography>

                      {/* Requester Direct Contact Box */}
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderRadius: 2.5,
                          bgcolor: 'background.default',
                          mb: 2,
                          borderLeft: '4px solid #059669',
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                          Requester Contact:
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          {req.requesterName}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.8 }}>
                          <Typography
                            component="a"
                            href={`tel:${req.requesterPhone}`}
                            variant="caption"
                            sx={{ fontWeight: 700, color: 'success.dark', textDecoration: 'none' }}
                          >
                            📞 {req.requesterPhone}
                          </Typography>

                          <Button
                            component="a"
                            href={`tel:${req.requesterPhone}`}
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<PhoneRoundedIcon fontSize="small" />}
                            sx={{ py: 0.2, px: 1.2, fontSize: '0.72rem', fontWeight: 800 }}
                          >
                            Call
                          </Button>
                        </Box>
                      </Paper>

                      {/* Location & Landmark */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <LocationOnRoundedIcon fontSize="small" sx={{ color: 'primary.main', mt: 0.2 }} />
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block' }}>
                              {req.location.address}
                            </Typography>
                            {req.location.landmark && (
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Landmark: <strong>{req.location.landmark}</strong> ({req.location.city || 'Delhi'})
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>

                      {/* Current Status Tracker Description */}
                      <Box sx={{ mb: 2, mt: 'auto', p: 1.2, borderRadius: 2, bgcolor: 'action.hover' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: req.status === 'IN_PROGRESS' ? 'info.main' : 'warning.main', display: 'block' }}>
                          {req.status === 'MATCHED' ? '🤝 Matched — Prepare aid pack' : '🚚 In Transit — Delivering to location'}
                        </Typography>
                      </Box>

                      {/* Action Buttons */}
                      <Stack spacing={1} sx={{ mt: 'auto' }}>
                        {req.status === 'MATCHED' && (
                          <Button
                            variant="contained"
                            color="warning"
                            fullWidth
                            disabled={updatingId === req.id}
                            onClick={() => handleStartTransit(req.id)}
                            startIcon={<LocalShippingRoundedIcon />}
                            sx={{ fontWeight: 800 }}
                          >
                            START DELIVERY / IN TRANSIT
                          </Button>
                        )}

                        {req.status === 'IN_PROGRESS' && (
                          <Button
                            variant="contained"
                            color="success"
                            fullWidth
                            disabled={updatingId === req.id}
                            onClick={() => handleFulfillMission(req.id)}
                            startIcon={<CheckCircleRoundedIcon />}
                            sx={{ fontWeight: 800 }}
                          >
                            MARK AS FULFILLED
                          </Button>
                        )}

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            fullWidth
                            size="small"
                            onClick={() => onNavigateToMap(req.id)}
                            startIcon={<MapRoundedIcon />}
                            sx={{ fontWeight: 700 }}
                          >
                            View on Map
                          </Button>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
};
