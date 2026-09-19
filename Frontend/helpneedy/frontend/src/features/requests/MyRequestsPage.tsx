import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  InputAdornment,
  useTheme,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import { useNotifications } from '../../context/NotificationContext';
import { HelpRequest } from '../../types';
import { api } from '../../services/api';
import { CategoryBadge } from '../../components/CategoryBadge/CategoryBadge';
import { UrgencyChip } from '../../components/UrgencyChip/UrgencyChip';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { RequestStatusTracker } from './RequestStatusTracker';

// Icons
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import AddAlertRoundedIcon from '@mui/icons-material/AddAlertRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';

interface MyRequestsPageProps {
  initialFocusRequestId?: string;
  onOpenCreateRequest: () => void;
  onNavigateToMap?: (requestId: string) => void;
}

export const MyRequestsPage: React.FC<MyRequestsPageProps> = ({
  initialFocusRequestId,
  onOpenCreateRequest,
  onNavigateToMap,
}) => {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const { requests, markRequestFulfilled, cancelRequest, refreshData } = useRequests();
  const { showToast } = useNotifications();

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Cancel Dialog State
  const [cancelModalId, setCancelModalId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // Strictly filter requests created by current user
  const myCreatedRequests = useMemo(() => {
    return requests.filter((r) => r.requesterId === currentUser.id);
  }, [requests, currentUser.id]);

  // Apply search query and status filter
  const filteredRequests = useMemo(() => {
    return myCreatedRequests.filter((req) => {
      // Status Filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'ACTIVE' && (req.status === 'FULFILLED' || req.status === 'CANCELLED')) {
          return false;
        }
        if (statusFilter !== 'ACTIVE' && req.status !== statusFilter) {
          return false;
        }
      }

      // Search Filter (ID, Title, Address, Landmark)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesId = req.id.toLowerCase().includes(query);
        const matchesTitle = req.title.toLowerCase().includes(query);
        const matchesAddress = (req.location?.address || '').toLowerCase().includes(query);
        const matchesLandmark = (req.location?.landmark || '').toLowerCase().includes(query);
        return matchesId || matchesTitle || matchesAddress || matchesLandmark;
      }

      return true;
    });
  }, [myCreatedRequests, statusFilter, searchQuery]);

  // Copy Reference ID to clipboard
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    showToast(`Copied ${id} to clipboard!`, 'info');
  };

  // Demo helper: Advance status for testing
  const handleSimulateStatusAdvance = async (req: HelpRequest) => {
    try {
      if (req.status === 'OPEN') {
        // Match with demo volunteer
        const mockVolunteer = {
          id: 'USR-VOL-02',
          name: 'Rahul Verma',
          email: 'rahul.verma@emergencyaid.org',
          phone: '+91 98101 22334',
          role: 'VOLUNTEER' as const,
          createdAt: new Date().toISOString(),
        };
        await api.requests.accept(req.id, mockVolunteer);
        await refreshData();
        showToast(`Simulated: Volunteer Rahul Verma matched with Request #${req.id}!`, 'success');
      } else if (req.status === 'MATCHED') {
        await api.requests.setInProgress(req.id);
        await refreshData();
        showToast(`Simulated: Volunteer has started transit for Request #${req.id}!`, 'info');
      } else if (req.status === 'IN_PROGRESS') {
        await markRequestFulfilled(req.id);
      }
    } catch (e) {
      showToast('Failed to advance simulated status', 'error');
    }
  };

  // Confirm cancellation
  const handleConfirmCancel = async () => {
    if (!cancelModalId) return;
    setIsCancelling(true);
    try {
      await cancelRequest(cancelModalId, cancelReason || 'Cancelled by requester');
      setCancelModalId(null);
      setCancelReason('');
    } catch (e) {
      showToast('Failed to cancel request', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* ---------------------------------------------------- */}
      {/* Top Banner & Header Stats */}
      {/* ---------------------------------------------------- */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: 2.5,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  bgcolor: 'primary.main',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                }}
              >
                <PendingActionsRoundedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>
                My Requests & Status Tracker
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Track the real-time lifecycle progression of your submitted disaster aid requests from broadcast to fulfillment.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Refresh Request List">
              <IconButton onClick={() => refreshData()} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <RefreshRoundedIcon />
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              color="primary"
              onClick={onOpenCreateRequest}
              startIcon={<AddAlertRoundedIcon />}
              sx={{ fontWeight: 700, px: 2.5 }}
            >
              + Create New Request
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* ---------------------------------------------------- */}
      {/* Search & Filter Toolbar */}
      {/* ---------------------------------------------------- */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          {/* Search Input */}
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by Request ID (#REQ-...), title, landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }
              }}
            />
          </Grid>

          {/* Status Quick Filter Chips */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mr: 0.5 }}>
                STATUS:
              </Typography>
              {[
                { label: 'All', value: 'ALL' },
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Open', value: 'OPEN' },
                { label: 'Matched', value: 'MATCHED' },
                { label: 'In Transit', value: 'IN_PROGRESS' },
                { label: 'Fulfilled', value: 'FULFILLED' },
              ].map((filter) => (
                <Chip
                  key={filter.value}
                  label={filter.label}
                  size="small"
                  clickable
                  color={statusFilter === filter.value ? 'primary' : 'default'}
                  variant={statusFilter === filter.value ? 'filled' : 'outlined'}
                  onClick={() => setStatusFilter(filter.value)}
                  sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* ---------------------------------------------------- */}
      {/* Requests List Area */}
      {/* ---------------------------------------------------- */}
      {filteredRequests.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 4, md: 8 },
            textAlign: 'center',
            borderRadius: 3.5,
            bgcolor: 'background.paper',
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: 'primary.light',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <PendingActionsRoundedIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            No Requests Found
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 450, mx: 'auto', mb: 3 }}>
            {searchQuery || statusFilter !== 'ALL'
              ? 'No submitted requests matched your filter criteria. Try clearing the filters.'
              : "You haven't submitted any aid requests yet. When disaster strikes, create a request to instantly broadcast to local responders."}
          </Typography>

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onOpenCreateRequest}
            startIcon={<AddAlertRoundedIcon />}
            sx={{ fontWeight: 700 }}
          >
            Create Your First Aid Request
          </Button>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {filteredRequests.map((req) => {
            const isFocused = req.id === initialFocusRequestId;

            return (
              <Card
                key={req.id}
                id={`request-card-${req.id}`}
                sx={{
                  borderRadius: 3.5,
                  border: isFocused ? '2.5px solid #0284C7' : '1px solid',
                  borderColor: isFocused ? 'primary.main' : 'divider',
                  boxShadow: isFocused ? '0 8px 30px rgba(2, 132, 199, 0.15)' : 'none',
                  transition: 'all 0.25s ease',
                  overflow: 'visible',
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                  {/* Top Bar: Reference ID, Badges, Timestamp */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: 1.5,
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.8 }}>
                        <Tooltip title="Click to copy Reference ID">
                          <Chip
                            icon={<ContentCopyRoundedIcon sx={{ fontSize: '13px !important' }} />}
                            label={req.id}
                            size="small"
                            onClick={() => handleCopyId(req.id)}
                            sx={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontWeight: 800,
                              cursor: 'pointer',
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(2, 132, 199, 0.2)' : 'rgba(2, 132, 199, 0.1)',
                              color: 'primary.main',
                              border: '1px solid',
                              borderColor: 'primary.light',
                            }}
                          />
                        </Tooltip>

                        <UrgencyChip urgency={req.urgency} size="small" />
                        <CategoryBadge category={req.category} />
                        <StatusBadge status={req.status} />

                        {isFocused && (
                          <Chip
                            label="Just Created"
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 800, height: 22, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>

                      <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
                        {req.title}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}
                      >
                        <AccessTimeRoundedIcon fontSize="inherit" />
                        Submitted: {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                        {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.3 }}>
                        {req.peopleCount} {req.peopleCount > 1 ? 'People' : 'Person'} Needing Support
                      </Typography>
                    </Box>
                  </Box>

                  {/* ---------------------------------------------------- */}
                  {/* Visual 4-Stage Lifecycle Stepper Tracker */}
                  {/* ---------------------------------------------------- */}
                  <Paper
                    variant="outlined"
                    sx={{
                      p: { xs: 1.5, sm: 2.5 },
                      my: 2.5,
                      borderRadius: 3,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(248, 250, 252, 0.8)',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: '0.04em' }}>
                        LIVE LIFECYCLE PROGRESS
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: req.status === 'FULFILLED' ? 'success.main' : req.status === 'OPEN' ? 'warning.main' : 'primary.main',
                        }}
                      >
                        {req.status === 'OPEN' && '⏳ Broadcasting to Nearby Helpers...'}
                        {req.status === 'MATCHED' && '🤝 Helper Assigned & Preparing Aid'}
                        {req.status === 'IN_PROGRESS' && '🚚 Aid in Transit / En Route'}
                        {req.status === 'FULFILLED' && '✅ Aid Delivered Successfully'}
                        {req.status === 'CANCELLED' && '❌ Request Cancelled'}
                      </Typography>
                    </Box>

                    <RequestStatusTracker status={req.status} />
                  </Paper>

                  {/* ---------------------------------------------------- */}
                  {/* Request Body & Coordination Details */}
                  {/* ---------------------------------------------------- */}
                  <Grid container spacing={2.5} sx={{ mb: 2 }}>
                    {/* Left Column: Description & Location */}
                    <Grid size={{ xs: 12, md: 7 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.6 }}>
                        {req.description || 'No additional notes provided.'}
                      </Typography>

                      <Stack spacing={1.2}>
                        {/* Address */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                          <LocationOnRoundedIcon fontSize="small" sx={{ color: 'primary.main', mt: 0.2 }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {req.location?.address || 'Location coordinates specified'}
                            </Typography>
                            {req.location?.landmark && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                Landmark: <strong>{req.location.landmark}</strong> ({req.location.city || 'Local Area'})
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {/* Privacy & People count */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PeopleAltRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                              {req.peopleCount} {req.peopleCount > 1 ? 'People' : 'Person'}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <SecurityRoundedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                              {req.locationVisibility === 'public_approximate' ? '300m Privacy Protected' : 'Precise Coordinates'}
                            </Typography>
                          </Box>
                        </Box>
                      </Stack>
                    </Grid>

                    {/* Right Column: Responder Coordination Card */}
                    <Grid size={{ xs: 12, md: 5 }}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2.2,
                          borderRadius: 3,
                          bgcolor: 'background.default',
                          border: req.status !== 'OPEN' && req.status !== 'CANCELLED' ? '1.5px solid rgba(5, 150, 105, 0.4)' : '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        {req.status === 'OPEN' ? (
                          <Box sx={{ textAlign: 'center', py: 1.5 }}>
                            <Box
                              sx={{
                                width: 42,
                                height: 42,
                                borderRadius: '50%',
                                bgcolor: 'rgba(217, 119, 6, 0.1)',
                                color: '#D97706',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 1,
                              }}
                            >
                              <PendingActionsRoundedIcon />
                            </Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                              Searching Nearby Responders
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                              Volunteers in your area are notified. As soon as one accepts, their phone and vehicle details will appear here.
                            </Typography>
                          </Box>
                        ) : req.status === 'CANCELLED' ? (
                          <Box sx={{ textAlign: 'center', py: 1.5 }}>
                            <CancelOutlinedIcon sx={{ color: 'text.disabled', fontSize: 36, mb: 0.5 }} />
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                              Request Cancelled
                            </Typography>
                          </Box>
                        ) : (
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase' }}>
                                ASSIGNED VOLUNTEER
                              </Typography>
                              <Chip
                                icon={<VerifiedRoundedIcon sx={{ fontSize: '13px !important', color: '#059669' }} />}
                                label="Verified Helper"
                                size="small"
                                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}
                              />
                            </Box>

                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                              {req.assignedVolunteerName || 'Assigned Volunteer'}
                            </Typography>

                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                              {req.status === 'MATCHED' && '🤝 Preparing aid pack for dispatch'}
                              {req.status === 'IN_PROGRESS' && '🚚 En route to your landmark location'}
                              {req.status === 'FULFILLED' && '✅ Aid delivered successfully'}
                            </Typography>

                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 1.2,
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneRoundedIcon fontSize="small" sx={{ color: 'success.main' }} />
                                <Typography
                                  component="a"
                                  href={`tel:${req.assignedVolunteerPhone || '+91 98101 22334'}`}
                                  variant="body2"
                                  sx={{
                                    fontWeight: 700,
                                    color: 'success.dark',
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' },
                                  }}
                                >
                                  {req.assignedVolunteerPhone || '+91 98101 22334'}
                                </Typography>
                              </Box>

                              <Button
                                component="a"
                                href={`tel:${req.assignedVolunteerPhone || '+91 98101 22334'}`}
                                variant="contained"
                                color="success"
                                size="small"
                                startIcon={<PhoneRoundedIcon fontSize="small" />}
                                sx={{ py: 0.3, px: 1.5, fontSize: '0.75rem', fontWeight: 700 }}
                              >
                                Call
                              </Button>
                            </Box>
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* ---------------------------------------------------- */}
                  {/* Action Buttons Row */}
                  {/* ---------------------------------------------------- */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1.5,
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      pt: 2,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    {/* Left: View on Incident Map & Simulation Tool */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {onNavigateToMap && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => onNavigateToMap(req.id)}
                          startIcon={<MapRoundedIcon />}
                          sx={{ fontWeight: 600 }}
                        >
                          View on Map
                        </Button>
                      )}

                      {/* Demo simulation shortcut to advance status easily */}
                      {req.status !== 'FULFILLED' && req.status !== 'CANCELLED' && (
                        <Tooltip title="Test/Demo: Advance request status to the next stage immediately">
                          <Button
                            variant="text"
                            size="small"
                            color="secondary"
                            onClick={() => handleSimulateStatusAdvance(req)}
                            startIcon={<PlayArrowRoundedIcon />}
                            sx={{ fontSize: '0.75rem', fontWeight: 700 }}
                          >
                            {req.status === 'OPEN' && 'Simulate Match'}
                            {req.status === 'MATCHED' && 'Simulate In-Transit'}
                            {req.status === 'IN_PROGRESS' && 'Simulate Deliver'}
                          </Button>
                        </Tooltip>
                      )}
                    </Box>

                    {/* Right: Primary Action Controls */}
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* Mark Fulfilled */}
                      {req.status !== 'FULFILLED' && req.status !== 'CANCELLED' && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => markRequestFulfilled(req.id)}
                          startIcon={<CheckCircleRoundedIcon />}
                          sx={{ fontWeight: 700 }}
                        >
                          Mark as Fulfilled
                        </Button>
                      )}

                      {/* Cancel Request Button */}
                      {req.status !== 'FULFILLED' && req.status !== 'CANCELLED' && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => setCancelModalId(req.id)}
                          startIcon={<CancelOutlinedIcon />}
                          sx={{ fontWeight: 600 }}
                        >
                          Cancel Request
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* ---------------------------------------------------- */}
      {/* Cancel Request Modal */}
      {/* ---------------------------------------------------- */}
      <Dialog open={Boolean(cancelModalId)} onClose={() => setCancelModalId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Cancel Aid Request?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            If you have already received assistance or no longer need supplies, please tell us why to update response teams.
          </Typography>
          <TextField
            fullWidth
            autoFocus
            label="Reason for cancellation"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g. Received drinking water from local shelter"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCancelModalId(null)}>Keep Request</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmCancel}
            disabled={isCancelling}
          >
            {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
