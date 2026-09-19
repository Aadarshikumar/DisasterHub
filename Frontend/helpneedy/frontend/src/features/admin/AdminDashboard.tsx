import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import { IncidentReport, AuditLog } from '../../types';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { CrisisMap } from '../map/CrisisMap';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';

interface AdminDashboardProps {
  initialSubTab?: 'map' | 'overview' | 'reports' | 'logs';
  onNavigateToTasks?: () => void;
  onOpenNeedHelp?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialSubTab = 'overview',
  onNavigateToTasks,
  onOpenNeedHelp,
}) => {
  const { showToast } = useNotifications();
  const [adminTab, setAdminTab] = useState<'map' | 'overview' | 'reports' | 'logs'>(initialSubTab);
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const loadAdminData = async () => {
    try {
      const [dashStats, repList, logList] = await Promise.all([
        api.admin.getDashboardStats(),
        api.admin.getReports(),
        api.admin.getAuditLogs(),
      ]);
      setStats(dashStats);
      setReports(repList);
      setAuditLogs(logList);
    } catch (e) {
      console.error('Failed to load admin stats', e);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleResolveReport = async (id: string) => {
    await api.admin.resolveReport(id);
    await loadAdminData();
    showToast(`Report #${id} marked as RESOLVED.`, 'success');
  };

  const handleResetSeed = () => {
    api.resetData();
    window.location.reload();
  };

  return (
    <Box>
      {/* Admin Header Banner */}
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                bgcolor: 'error.light',
                color: 'error.dark',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AdminPanelSettingsRoundedIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Crisis Command Center & Admin
                </Typography>
                <Chip
                  label="COMMAND DISPATCH"
                  color="error"
                  size="small"
                  sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Geospatial situational awareness, response oversight, and security moderation.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={handleResetSeed}
              startIcon={<RestartAltRoundedIcon />}
            >
              Reset Demo State
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {/* Admin Section Tabs */}
        <Tabs
          value={adminTab}
          onChange={(_, val) => setAdminTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab
            value="map"
            label="Live Crisis Geospatial Map"
            icon={<MapRoundedIcon />}
            iconPosition="start"
            sx={{ fontWeight: 700, textTransform: 'none', minHeight: 44 }}
          />
          <Tab
            value="overview"
            label="Operations & Analytics"
            icon={<AnalyticsRoundedIcon />}
            iconPosition="start"
            sx={{ fontWeight: 700, textTransform: 'none', minHeight: 44 }}
          />
          <Tab
            value="reports"
            label={`Abuse Reports (${reports.filter(r => r.status === 'PENDING').length})`}
            icon={<ShieldRoundedIcon />}
            iconPosition="start"
            sx={{ fontWeight: 700, textTransform: 'none', minHeight: 44 }}
          />
          <Tab
            value="logs"
            label="Audit Trail"
            icon={<HistoryRoundedIcon />}
            iconPosition="start"
            sx={{ fontWeight: 700, textTransform: 'none', minHeight: 44 }}
          />
        </Tabs>
      </Paper>

      {/* View 1: Embedded Live Crisis Map */}
      {adminTab === 'map' && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MapRoundedIcon color="primary" />
                Live Geospatial Incident Map & Responder Tracking
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Real-time incident pins, volunteer service radii, and NGO relief caches.
              </Typography>
            </Box>
          </Box>

          <CrisisMap
            onNavigateToTasks={onNavigateToTasks}
            onOpenNeedHelp={onOpenNeedHelp}
          />
        </Box>
      )}

      {/* View 2: Analytics & Metrics Overview */}
      {adminTab === 'overview' && (
        <Box>
          {stats && (
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              {/* Total Requests */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                      TOTAL CRISIS REQUESTS
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.main' }}>
                      {stats.totalRequests}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Broadcasted across all sectors
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Critical Pending */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ borderRadius: 3, border: stats.criticalPending > 0 ? '1.5px solid #DC2626' : '1px solid' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main' }}>
                      CRITICAL PENDING
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'error.main' }}>
                      {stats.criticalPending}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Awaiting immediate responder dispatch
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Fulfillment Rate */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main' }}>
                      FULFILLMENT RATE
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'success.main' }}>
                      {stats.fulfillmentRate}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {stats.fulfilledCount} requests marked fulfilled
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Active Volunteers & Inventory */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                      ACTIVE VOLUNTEERS
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'secondary.main' }}>
                      {stats.activeVolunteers}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {stats.totalResources} stockpiled resource units
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Quick Shortcuts */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: 'background.default', mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
              Command Actions & Emergency GIS
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Access full geospatial map overlay to coordinate with field teams or moderate flagged incidents.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setAdminTab('map')}
                startIcon={<MapRoundedIcon />}
              >
                Open Live Incident Map
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => setAdminTab('reports')}
                startIcon={<ShieldRoundedIcon />}
              >
                Review Flagged Reports ({reports.filter(r => r.status === 'PENDING').length})
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* View 3: Moderation Reports Table */}
      {adminTab === 'reports' && (
        <Card sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SecurityRoundedIcon color="error" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Abuse Prevention & Incident Reports (PRD Section 20)
              </Typography>
            </Box>

            {reports.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No flagged incidents reported.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Report ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Target</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Reason / Description</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.map((rep) => (
                      <TableRow key={rep.id}>
                        <TableCell sx={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                          {rep.id}
                        </TableCell>
                        <TableCell>
                          <Chip label={`${rep.targetType}: ${rep.targetId}`} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>{rep.reason}</TableCell>
                        <TableCell>
                          <Chip
                            label={rep.status}
                            size="small"
                            color={rep.status === 'RESOLVED' ? 'success' : 'warning'}
                            sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>
                          {rep.status !== 'RESOLVED' && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleResolveReport(rep.id)}
                              sx={{ fontSize: '0.75rem', py: 0.3 }}
                            >
                              Resolve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* View 4: Audit Logs Table */}
      {adminTab === 'logs' && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <HistoryRoundedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Immutable Platform Audit Trail (PRD Section 11)
              </Typography>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actor</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Entity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{log.actorName}</TableCell>
                      <TableCell>
                        <Chip label={log.actorRole} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'primary.main' }}>
                        {log.action}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.82rem' }}>
                        {log.entityType} ({log.entityId})
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
