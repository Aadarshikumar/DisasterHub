import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Button,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import { api } from '../../services/api';
import { CategoryBadge } from '../../components/CategoryBadge/CategoryBadge';
import { UrgencyChip } from '../../components/UrgencyChip/UrgencyChip';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { RequestStatusTracker } from './RequestStatusTracker';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

interface ActiveTasksManagerProps {
  initialFocusRequestId?: string;
  onOpenCreateRequest: () => void;
}

export const ActiveTasksManager: React.FC<ActiveTasksManagerProps> = ({
  initialFocusRequestId,
  onOpenCreateRequest,
}) => {
  const { currentUser, activeRole } = useAuth();
  const { requests, markRequestFulfilled, cancelRequest, refreshData } = useRequests();

  // Tab selector: 0: My Created Requests, 1: My Accepted Missions, 2: All Crisis Activity
  const [tabIndex, setTabIndex] = useState<number>(() => {
    return activeRole === 'VOLUNTEER' ? 1 : 0;
  });

  const [cancelModalId, setCancelModalId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  // Filter requests according to tabs
  const myCreated = requests.filter((r) => r.requesterId === currentUser.id);
  const myAssigned = requests.filter((r) => r.assignedVolunteerId === currentUser.id);

  const displayedRequests =
    tabIndex === 0 ? myCreated : tabIndex === 1 ? myAssigned : requests;

  const handleSetInProgress = async (requestId: string) => {
    await api.requests.setInProgress(requestId);
    await refreshData();
  };

  const handleConfirmCancel = async () => {
    if (cancelModalId) {
      await cancelRequest(cancelModalId, cancelReason);
      setCancelModalId(null);
      setCancelReason('');
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Active Tasks & Request Tracking
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Monitor real-time lifecycle progression from initial dispatch to delivery completion.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={onOpenCreateRequest}
          startIcon={<CheckCircleRoundedIcon />}
        >
          + New Help Request
        </Button>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2.5, bgcolor: 'background.paper' }}>
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab 
            label={`My Requests (${myCreated.length})`} 
            sx={{ fontWeight: 700, textTransform: 'none' }} 
          />
          <Tab 
            label={`Assigned Missions (${myAssigned.length})`} 
            sx={{ fontWeight: 700, textTransform: 'none' }} 
          />
          <Tab 
            label={`All Community Requests (${requests.length})`} 
            sx={{ fontWeight: 700, textTransform: 'none' }} 
          />
        </Tabs>
      </Paper>

      {/* Requests List */}
      {displayedRequests.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
            No tasks found in this view.
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.disabled', mb: 2 }}>
            {tabIndex === 0
              ? "You haven't posted any help requests yet."
              : tabIndex === 1
              ? 'You have not accepted any volunteer assignments yet. Check the Volunteer Hub or Crisis Map!'
              : 'No active community requests available.'}
          </Typography>
          {tabIndex === 0 && (
            <Button variant="contained" onClick={onOpenCreateRequest}>
              Create Aid Request Now
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {displayedRequests.map((req) => {
            const isMyRequest = req.requesterId === currentUser.id;
            const isMyAssignment = req.assignedVolunteerId === currentUser.id;

            return (
              <Grid size={{ xs: 12 }} key={req.id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: req.id === initialFocusRequestId ? '2px solid #0284C7' : '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    {/* Top Bar */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontWeight: 800,
                              color: 'primary.main',
                            }}
                          >
                            #{req.id}
                          </Typography>
                          <UrgencyChip urgency={req.urgency} size="small" />
                          <CategoryBadge category={req.category} />
                          <StatusBadge status={req.status} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {req.title}
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeRoundedIcon fontSize="inherit" />
                          Created: {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
                          {req.peopleCount} {req.peopleCount > 1 ? 'People' : 'Person'} in Need
                        </Typography>
                      </Box>
                    </Box>

                    {/* Visual 4-Step Lifecycle Progress Tracker */}
                    <Box sx={{ my: 2 }}>
                      <RequestStatusTracker status={req.status} />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Metadata & Coordination Panel */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid size={{ xs: 12, md: 7 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                          {req.description}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, color: 'text.primary' }}>
                          <LocationOnRoundedIcon fontSize="small" sx={{ color: 'primary.main', mt: 0.2 }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {req.location.address}
                            </Typography>
                            {req.location.landmark && (
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Landmark: {req.location.landmark} ({req.location.city})
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Grid>

                      {/* Volunteer or Requester Contact Badge */}
                      <Grid size={{ xs: 12, md: 5 }}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: 'background.default' }}>
                          {req.status === 'OPEN' ? (
                            <Box sx={{ textAlign: 'center', py: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                Searching Nearby Helpers...
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                As soon as a volunteer accepts, their phone and vehicle details will appear here.
                              </Typography>
                            </Box>
                          ) : (
                            <Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.5 }}>
                                {isMyRequest ? 'ASSIGNED VOLUNTEER' : 'REQUESTER CONTACT'}
                              </Typography>

                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {isMyRequest ? req.assignedVolunteerName : req.requesterName}
                              </Typography>

                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.8, flexWrap: 'wrap', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                  <PhoneRoundedIcon fontSize="small" sx={{ color: 'success.main' }} />
                                  <Typography
                                    component="a"
                                    href={`tel:${isMyRequest ? req.assignedVolunteerPhone : req.requesterPhone}`}
                                    variant="body2"
                                    sx={{
                                      fontWeight: 700,
                                      color: 'success.dark',
                                      textDecoration: 'none',
                                      '&:hover': { textDecoration: 'underline' },
                                    }}
                                  >
                                    {isMyRequest ? req.assignedVolunteerPhone : req.requesterPhone}
                                  </Typography>
                                </Box>

                                <Button
                                  component="a"
                                  href={`tel:${isMyRequest ? req.assignedVolunteerPhone : req.requesterPhone}`}
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

                    {/* Action Buttons Row */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'flex-end', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                      {/* Volunteer: Mark in transit */}
                      {isMyAssignment && req.status === 'MATCHED' && (
                        <Button
                          variant="contained"
                          color="warning"
                          size="small"
                          onClick={() => handleSetInProgress(req.id)}
                          startIcon={<LocalShippingRoundedIcon />}
                        >
                          Start Delivery / In Transit
                        </Button>
                      )}

                      {/* Requester or Volunteer: Mark Fulfilled */}
                      {req.status !== 'FULFILLED' && req.status !== 'CANCELLED' && (isMyRequest || isMyAssignment) && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => markRequestFulfilled(req.id)}
                          startIcon={<CheckCircleRoundedIcon />}
                        >
                          Mark as Fulfilled
                        </Button>
                      )}

                      {/* Cancel Request Button */}
                      {req.status !== 'FULFILLED' && req.status !== 'CANCELLED' && isMyRequest && (
                        <Button
                          variant="outlined"
                          color="inherit"
                          size="small"
                          onClick={() => setCancelModalId(req.id)}
                          startIcon={<CancelOutlinedIcon />}
                        >
                          Cancel Request
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={Boolean(cancelModalId)} onClose={() => setCancelModalId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Cancel Aid Request?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            If you have already received help or no longer require assistance, please provide a brief reason.
          </Typography>
          <TextField
            fullWidth
            label="Reason for cancellation"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g. Help received from local neighbors"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCancelModalId(null)}>Back</Button>
          <Button variant="contained" color="error" onClick={handleConfirmCancel}>
            Confirm Cancellation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
