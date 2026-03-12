/*
 * Copyright (c) 2026 Auditsoft
 * All rights reserved.
 */

import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    InputAdornment,
    Chip,
    Grid,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Alert,
    Tabs,
    Tab,
    Button,
    IconButton
} from '@mui/material';
import {
    Search,
    ExpandMore,
    HelpOutline,
    Security,
    Assessment,
    People,
    Settings,
    Timeline,
    Description,
    Warning,
    CheckCircle,
    School,
    Gavel,
    TrendingUp,
    Folder,
    Email,
    Phone,
    QuestionAnswer,
    Bookmark,
    BookmarkBorder,
    AccessTime,
    History,
} from '@mui/icons-material';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`help-tabpanel-${index}`}
            aria-labelledby={`help-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const HelpPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [bookmarkedSections, setBookmarkedSections] = useState<string[]>([]);

    const toggleBookmark = (sectionId: string) => {
        setBookmarkedSections(prev => 
            prev.includes(sectionId) 
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const helpSections = useMemo(() => [
        {
            id: 'getting-started',
            title: 'Getting Started',
            icon: <School />,
            category: 'general',
            keywords: ['start', 'begin', 'new', 'introduction', 'overview'],
            content: (
                <Box>
                    <Typography variant="h6" gutterBottom>Welcome to Auditsoft</Typography>
                    <Typography paragraph>
                        Auditsoft is a comprehensive audit management system designed to streamline your audit processes, 
                        from planning and execution to reporting and remediation.
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>Key Features:</Typography>
                    <List dense>
                        <ListItem><ListItemIcon><CheckCircle color="success" /></ListItemIcon><ListItemText primary="Complete audit lifecycle management" /></ListItem>
                        <ListItem><ListItemIcon><CheckCircle color="success" /></ListItemIcon><ListItemText primary="Risk assessment and control mapping" /></ListItem>
                        <ListItem><ListItemIcon><CheckCircle color="success" /></ListItemIcon><ListItemText primary="Real-time collaboration and notifications" /></ListItem>
                        <ListItem><ListItemIcon><CheckCircle color="success" /></ListItemIcon><ListItemText primary="Comprehensive reporting and analytics" /></ListItem>
                    </List>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                            Start by exploring your dashboard to see your assigned tasks and recent activities.
                        </Typography>
                    </Alert>
                </Box>
            )
        },
        {
            id: 'dashboard-navigation',
            title: 'Dashboard Navigation',
            icon: <Assessment />,
            category: 'general',
            keywords: ['dashboard', 'navigate', 'menu', 'sidebar'],
            content: (
                <Box>
                    <Typography variant="h6" gutterBottom>Understanding Your Dashboard</Typography>
                    <Typography paragraph>
                        The dashboard is your central hub for accessing all audit-related information and tools.
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>Main Navigation Areas:</Typography>
                                <List dense>
                                    <ListItem><ListItemIcon><Folder /></ListItemIcon><ListItemText primary="Audits - View and manage all audits" /></ListItem>
                                    <ListItem><ListItemIcon><Timeline /></ListItemIcon><ListItemText primary="Audit Plans - Strategic planning tools" /></ListItem>
                                    <ListItem><ListItemIcon><Security /></ListItemIcon><ListItemText primary="Compliance - Standards and controls" /></ListItem>
                                    <ListItem><ListItemIcon><TrendingUp /></ListItemIcon><ListItemText primary="Risk - Risk assessment and KRIs" /></ListItem>
                                </List>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>Quick Actions:</Typography>
                                <List dense>
                                    <ListItem><ListItemIcon><Description /></ListItemIcon><ListItemText primary="Create new audit or finding" /></ListItem>
                                    <ListItem><ListItemIcon><People /></ListItemIcon><ListItemText primary="View team assignments" /></ListItem>
                                    <ListItem><ListItemIcon><Settings /></ListItemIcon><ListItemText primary="Access system settings" /></ListItem>
                                    <ListItem><ListItemIcon><Email /></ListItemIcon><ListItemText primary="Check notifications" /></ListItem>
                                </List>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            )
        },
        {
            id: 'audit-lifecycle',
            title: 'Audit Lifecycle Management',
            icon: <Timeline />,
            category: 'audits',
            keywords: ['audit', 'lifecycle', 'process', 'workflow', 'status'],
            content: (
                <Box>
                    <Typography variant="h6" gutterBottom>Understanding the Audit Process</Typography>
                    <Typography paragraph>
                        Audits follow a structured workflow from planning through completion. Each stage has specific 
                        requirements and permissions.
                    </Typography>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">1. Planning Stage</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Define audit scope, objectives, and resource requirements.
                            </Typography>
                            <List dense>
                                <ListItem><ListItemText primary="Create audit plans and programs" /></ListItem>
                                <ListItem><ListItemText primary="Assign audit team members" /></ListItem>
                                <ListItem><ListItemText primary="Set timelines and milestones" /></ListItem>
                                <ListItem><ListItemText primary="Define risk assessment criteria" /></ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">2. Execution Stage</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Conduct fieldwork, gather evidence, and document findings.
                            </Typography>
                            <List dense>
                                <ListItem><ListItemText primary="Execute audit programs" /></ListItem>
                                <ListItem><ListItemText primary="Collect and analyze evidence" /></ListItem>
                                <ListItem><ListItemText primary="Document findings and observations" /></ListItem>
                                <ListItem><ListItemText primary="Create working papers" /></ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">3. Review Stage</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Review findings, prepare reports, and obtain approvals.
                            </Typography>
                            <List dense>
                                <ListItem><ListItemText primary="Review audit findings" /></ListItem>
                                <ListItem><ListItemText primary="Prepare draft reports" /></ListItem>
                                <ListItem><ListItemText primary="Obtain management review" /></ListItem>
                                <ListItem><ListItemText primary="Chief Auditor approval" /></ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">4. Reporting and Closure</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Finalize reports, generate recommendations, and close audits.
                            </Typography>
                            <List dense>
                                <ListItem><ListItemText primary="Generate final audit reports" /></ListItem>
                                <ListItem><ListItemText primary="Include risk analysis and control mapping" /></ListItem>
                                <ListItem><ListItemText primary="Chief Auditor saves and finalizes report" /></ListItem>
                                <ListItem><ListItemText primary="Audit status changes to Report Generated" /></ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            )
        },
        {
            id: 'findings-management',
            title: 'Findings Management',
            icon: <Warning />,
            category: 'audits',
            keywords: ['findings', 'issues', 'observations', 'deficiencies'],
            content: (
                <Box>
                    <Typography variant="h6" gutterBottom>Managing Audit Findings</Typography>
                    <Typography paragraph>
                        Findings are the results of audit work that identify issues, deficiencies, or areas for improvement. 
                        Proper management ensures effective remediation and tracking.
                    </Typography>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Creating Findings</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Document audit findings with proper classification and severity assessment.
                            </Typography>
                            <List dense>
                                <ListItem><ListItemText primary="Title and Description" /></ListItem>
                                <ListItem><ListItemText primary="Severity Level (Critical, High, Medium, Low)" /></ListItem>
                                <ListItem><ListItemText primary="Category and Risk Impact" /></ListItem>
                                <ListItem><ListItemText primary="Supporting Evidence References" /></ListItem>
                                <ListItem><ListItemText primary="Recommendations for Remediation" /></ListItem>
                            </List>
                            <Alert severity="info" sx={{ mt: 1 }}>
                                <Typography variant="body2">
                                    All findings must be supported by sufficient evidence and clearly articulated.
                                </Typography>
                            </Alert>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Finding Classification</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Severity Levels:</Typography>
                                        <List dense>
                                            <ListItem><ListItemText primary="Critical - Immediate action required" /></ListItem>
                                            <ListItem><ListItemText primary="High - Significant risk exposure" /></ListItem>
                                            <ListItem><ListItemText primary="Medium - Moderate impact" /></ListItem>
                                            <ListItem><ListItemText primary="Low - Minor improvement opportunity" /></ListItem>
                                        </List>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Categories:</Typography>
                                        <List dense>
                                            <ListItem><ListItemText primary="Control Deficiency" /></ListItem>
                                            <ListItem><ListItemText primary="Policy Violation" /></ListItem>
                                            <ListItem><ListItemText primary="Process Gap" /></ListItem>
                                            <ListItem><ListItemText primary="Compliance Issue" /></ListItem>
                                        </List>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Review and Approval</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Findings go through a review process before final approval.
                            </Typography>
                            <List dense>
                                <ListItem><ListItemText primary="Auditor creates initial finding" /></ListItem>
                                <ListItem><ListItemText primary="Audit Manager reviews for accuracy" /></ListItem>
                                <ListItem><ListItemText primary="Stakeholder comments addressed" /></ListItem>
                                <ListItem><ListItemText primary="Chief Auditor final approval" /></ListItem>
                                <ListItem><ListItemText primary="Finding status updated to 'Approved'" /></ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            )
        },
        {
            id: 'action-plans',
            title: 'Action Plans Management',
            icon: <TrendingUp />,
            category: 'audits',
            keywords: ['action plans', 'remediation', 'corrective actions', 'follow-up'],
            content: (
                <Box>
                    <Typography variant="h6" gutterBottom>Action Plans and Remediation</Typography>
                    <Typography paragraph>
                        Action plans are structured responses to audit findings that outline corrective actions, 
                        responsibilities, and timelines for remediation.
                    </Typography>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Creating Action Plans</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Develop comprehensive action plans to address audit findings.
                            </Typography>
                            <List dense>
                                <ListItem><ListItemText primary="Detailed action description" /></ListItem>
                                <ListItem><ListItemText primary="Assigned owner and responsibilities" /></ListItem>
                                <ListItem><ListItemText primary="Target completion date" /></ListItem>
                                <ListItem><ListItemText primary="Resource requirements" /></ListItem>
                                <ListItem><ListItemText primary="Success criteria and metrics" /></ListItem>
                                <ListItem><ListItemText primary="Dependencies and constraints" /></ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Tracking and Monitoring</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Monitor progress and ensure timely completion of action plans.
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Status Tracking:</Typography>
                                        <List dense>
                                            <ListItem><ListItemText primary="Not Started" /></ListItem>
                                            <ListItem><ListItemText primary="In Progress" /></ListItem>
                                            <ListItem><ListItemText primary="On Hold" /></ListItem>
                                            <ListItem><ListItemText primary="Completed" /></ListItem>
                                            <ListItem><ListItemText primary="Overdue" /></ListItem>
                                        </List>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Monitoring Tools:</Typography>
                                        <List dense>
                                            <ListItem><ListItemText primary="Progress updates" /></ListItem>
                                            <ListItem><ListItemText primary="Deadline reminders" /></ListItem>
                                            <ListItem><ListItemText primary="Escalation triggers" /></ListItem>
                                            <ListItem><ListItemText primary="Completion verification" /></ListItem>
                                        </List>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Validation and Closure</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Validate that actions effectively address the underlying issues.
                            </Typography>
                            <List dense>
                                <ListItem><ListItemText primary="Evidence of implementation" /></ListItem>
                                <ListItem><ListItemText primary="Effectiveness assessment" /></ListItem>
                                <ListItem><ListItemText primary="Stakeholder confirmation" /></ListItem>
                                <ListItem><ListItemText primary="Audit team validation" /></ListItem>
                                <ListItem><ListItemText primary="Finding closure documentation" /></ListItem>
                            </List>
                            <Alert severity="success" sx={{ mt: 1 }}>
                                <Typography variant="body2">
                                    Proper validation ensures sustainable improvements and recurrence prevention.
                                </Typography>
                            </Alert>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            )
        },
        {
            id: 'evidence-management',
            title: 'Evidence Management',
            icon: <Folder />,
            category: 'audits',
            keywords: ['evidence', 'documentation', 'working papers', 'proof'],
            content: (
                <Box>
                    <Typography variant="h6" gutterBottom>Evidence and Working Papers</Typography>
                    <Typography paragraph>
                        Evidence management ensures proper collection, storage, and documentation of audit evidence 
                        to support findings and conclusions.
                    </Typography>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Evidence Collection</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Collect sufficient and appropriate evidence to support audit conclusions.
                            </Typography>
                            <List dense>
                                <ListItem><ListItemText primary="Documentary evidence (policies, procedures)" /></ListItem>
                                <ListItem><ListItemText primary="Interview records and testimonies" /></ListItem>
                                <ListItem><ListItemText primary="Observation notes and photos" /></ListItem>
                                <ListItem><ListItemText primary="System reports and data extracts" /></ListItem>
                                <ListItem><ListItemText primary="Third-party confirmations" /></ListItem>
                            </List>
                            <Alert severity="warning" sx={{ mt: 1 }}>
                                <Typography variant="body2">
                                    Evidence must be relevant, reliable, and sufficient to support audit findings.
                                </Typography>
                            </Alert>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Working Papers</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Create comprehensive working papers that document audit procedures and results.
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Working Paper Components:</Typography>
                                        <List dense>
                                            <ListItem><ListItemText primary="Audit objectives" /></ListItem>
                                            <ListItem><ListItemText primary="Scope and methodology" /></ListItem>
                                            <ListItem><ListItemText primary="Procedures performed" /></ListItem>
                                            <ListItem><ListItemText primary="Results and conclusions" /></ListItem>
                                            <ListItem><ListItemText primary="Evidence references" /></ListItem>
                                        </List>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Best Practices:</Typography>
                                        <List dense>
                                            <ListItem><ListItemText primary="Clear and concise documentation" /></ListItem>
                                            <ListItem><ListItemText primary="Proper referencing and cross-referencing" /></ListItem>
                                            <ListItem><ListItemText primary="Date and author identification" /></ListItem>
                                            <ListItem><ListItemText primary="Review and approval signatures" /></ListItem>
                                        </List>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Digital Evidence Management</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Manage digital evidence securely and maintain audit trail integrity.
                            </Typography>
                            <List dense>
                                <ListItem><ListItemText primary="Secure file storage and access controls" /></ListItem>
                                <ListItem><ListItemText primary="Version control and change tracking" /></ListItem>
                                <ListItem><ListItemText primary="Metadata preservation" /></ListItem>
                                <ListItem><ListItemText primary="Backup and retention policies" /></ListItem>
                                <ListItem><ListItemText primary="Chain of custody documentation" /></ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            )
        },
        {
            id: 'time-tracking',
            title: 'Audit Time Tracking',
            icon: <AccessTime />,
            category: 'audits',
            keywords: ['timesheets', 'time tracking', 'hours', 'billing', 'productivity'],
            content: (
                <Box>
                    <Typography variant="h6" gutterBottom>Time Tracking and Timesheets</Typography>
                    <Typography paragraph>
                        Track time spent on audit activities for resource management, billing, and productivity analysis.
                    </Typography>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Timesheet Management</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Record and manage time entries for audit activities.
                            </Typography>
                            <List dense>
                                <ListItem><ListItemText primary="Daily time entry recording" /></ListItem>
                                <ListItem><ListItemText primary="Activity categorization" /></ListItem>
                                <ListItem><ListItemText primary="Audit program assignment" /></ListItem>
                                <ListItem><ListItemText primary="Billable vs. non-billable hours" /></ListItem>
                                <ListItem><ListItemText primary="Overtime tracking" /></ListItem>
                            </List>
                            <Paper sx={{ p: 2, mt: 2, bgcolor: 'info.light' }}>
                                <Typography variant="subtitle2" gutterBottom>Activity Categories:</Typography>
                                <Grid container spacing={1}>
                                    <Grid size={{ xs: 12, sm: 6 }}><ListItemText primary="• Planning and preparation" /></Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}><ListItemText primary="• Fieldwork execution" /></Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}><ListItemText primary="• Documentation and reporting" /></Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}><ListItemText primary="• Travel and meetings" /></Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}><ListItemText primary="• Review and quality control" /></Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}><ListItemText primary="• Training and development" /></Grid>
                                </Grid>
                            </Paper>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Time Analysis and Reporting</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Analyze time data for insights and decision-making.
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Analysis Reports:</Typography>
                                        <List dense>
                                            <ListItem><ListItemText primary="Budget vs. actual comparison" /></ListItem>
                                            <ListItem><ListItemText primary="Productivity metrics" /></ListItem>
                                            <ListItem><ListItemText primary="Resource utilization" /></ListItem>
                                            <ListItem><ListItemText primary="Trend analysis" /></ListItem>
                                        </List>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Key Metrics:</Typography>
                                        <List dense>
                                            <ListItem><ListItemText primary="Hours per audit program" /></ListItem>
                                            <ListItem><ListItemText primary="Cost per audit" /></ListItem>
                                            <ListItem><ListItemText primary="Team utilization rates" /></ListItem>
                                            <ListItem><ListItemText primary="Efficiency ratios" /></ListItem>
                                        </List>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Approval and Validation</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Ensure accurate and approved time entries.
                            </Typography>
                            <List dense>
                                <ListItem><ListItemText primary="Employee self-review" /></ListItem>
                                <ListItem><ListItemText primary="Manager review and approval" /></ListItem>
                                <ListItem><ListItemText primary="Client validation (if applicable)" /></ListItem>
                                <ListItem><ListItemText primary="Payroll integration" /></ListItem>
                                <ListItem><ListItemText primary="Audit trail maintenance" /></ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            )
        },
        {
            id: 'audit-logs',
            title: 'Audit Logs and System Tracking',
            icon: <History />,
            category: 'system',
            keywords: ['audit logs', 'system logs', 'tracking', 'audit trail', 'compliance'],
            content: (
                <Box>
                    <Typography variant="h6" gutterBottom>Audit Logs and System Tracking</Typography>
                    <Typography paragraph>
                        Comprehensive audit trail system that tracks all user activities, system changes, 
                        and data modifications for compliance and security monitoring.
                    </Typography>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">System Audit Logs</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Track all system activities for security and compliance purposes.
                            </Typography>
                            <List dense>
                                <ListItem><ListItemText primary="User login and logout events" /></ListItem>
                                <ListItem><ListItemText primary="Data creation, modification, and deletion" /></ListItem>
                                <ListItem><ListItemText primary="Permission changes and role assignments" /></ListItem>
                                <ListItem><ListItemText primary="System configuration updates" /></ListItem>
                                <ListItem><ListItemText primary="Failed authentication attempts" /></ListItem>
                                <ListItem><ListItemText primary="Export and download activities" /></ListItem>
                            </List>
                            <Alert severity="info" sx={{ mt: 1 }}>
                                <Typography variant="body2">
                                    All logs include timestamp, user ID, action type, and affected resources.
                                </Typography>
                            </Alert>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Audit Workflow Tracking</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Monitor audit lifecycle changes and status transitions.
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Workflow Events:</Typography>
                                        <List dense>
                                            <ListItem><ListItemText primary="Audit creation and setup" /></ListItem>
                                            <ListItem><ListItemText primary="Status transitions" /></ListItem>
                                            <ListItem><ListItemText primary="Assignments and reassignments" /></ListItem>
                                            <ListItem><ListItemText primary="Approvals and rejections" /></ListItem>
                                            <ListItem><ListItemText primary="Report generation" /></ListItem>
                                        </List>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Change Details:</Typography>
                                        <List dense>
                                            <ListItem><ListItemText primary="Before/after values" /></ListItem>
                                            <ListItem><ListItemText primary="Change justification" /></ListItem>
                                            <ListItem><ListItemText primary="Approver comments" /></ListItem>
                                            <ListItem><ListItemText primary="Impact assessment" /></ListItem>
                                        </List>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Log Analysis and Reporting</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Analyze audit logs for insights and compliance monitoring.
                            </Typography>
                            <List dense>
                                <ListItem><ListItemText primary="User activity patterns" /></ListItem>
                                <ListItem><ListItemText primary="Security incident detection" /></ListItem>
                                <ListItem><ListItemText primary="Compliance verification" /></ListItem>
                                <ListItem><ListItemText primary="Performance monitoring" /></ListItem>
                                <ListItem><ListItemText primary="Anomaly detection" /></ListItem>
                            </List>
                            <Paper sx={{ p: 2, mt: 2, bgcolor: 'warning.light' }}>
                                <Typography variant="subtitle2" gutterBottom>Retention and Archival:</Typography>
                                <List dense>
                                    <ListItem><ListItemText primary="Configurable retention periods" /></ListItem>
                                    <ListItem><ListItemText primary="Automated archival processes" /></ListItem>
                                    <ListItem><ListItemText primary="Compliance with regulatory requirements" /></ListItem>
                                    <ListItem><ListItemText primary="Secure storage and encryption" /></ListItem>
                                </List>
                            </Paper>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Security and Access Control</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Ensure audit log integrity and controlled access.
                            </Typography>
                            <List dense>
                                <ListItem><ListItemText primary="Role-based log access permissions" /></ListItem>
                                <ListItem><ListItemText primary="Immutable log records" /></ListItem>
                                <ListItem><ListItemText primary="Digital signatures and hashing" /></ListItem>
                                <ListItem><ListItemText primary="Secure log transmission" /></ListItem>
                                <ListItem><ListItemText primary="Backup and disaster recovery" /></ListItem>
                            </List>
                            <Alert severity="success" sx={{ mt: 1 }}>
                                <Typography variant="body2">
                                    Audit logs are protected against unauthorized modification and provide reliable evidence for compliance audits.
                                </Typography>
                            </Alert>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            )
        },
        {
            id: 'chief-auditor-workflow',
            title: 'Chief Auditor Report Generation',
            icon: <Gavel />,
            category: 'audits',
            keywords: ['chief auditor', 'report', 'generation', 'save', 'close'],
            content: (
                <Box>
                    <Typography variant="h6" gutterBottom>Enhanced Report Generation Process</Typography>
                    <Alert severity="success" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            <strong>New Feature:</strong> Reports now include comprehensive risk analysis and control mapping!
                        </Typography>
                    </Alert>
                    <Typography paragraph>
                        As Chief Auditor, you can now generate enhanced reports after audit closure with the following workflow:
                    </Typography>
                    <List>
                        <ListItem>
                            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                            <ListItemText 
                                primary="Step 1: Close Audit" 
                                secondary="Transition audit from 'Finalized' to 'Closed' status"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                            <ListItemText 
                                primary="Step 2: Preview Report" 
                                secondary="Review the enhanced report content with risk analysis"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                            <ListItemText 
                                primary="Step 3: Save Report" 
                                secondary="Generate the final PDF with risk analysis and control mapping"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                            <ListItemText 
                                primary="Step 4: Close Report" 
                                secondary="Finalize and transition to 'Report Generated' status"
                            />
                        </ListItem>
                    </List>
                    <Paper sx={{ p: 2, mt: 2, bgcolor: 'info.light' }}>
                        <Typography variant="subtitle2" gutterBottom>Report Enhancements:</Typography>
                        <List dense>
                            <ListItem><ListItemText primary="Risk Analysis Section with detailed risk assessments" /></ListItem>
                            <ListItem><ListItemText primary="Control Mapping showing compliance framework coverage" /></ListItem>
                            <ListItem><ListItemText primary="Enhanced findings with action plans and ownership" /></ListItem>
                            <ListItem><ListItemText primary="Professional formatting with comprehensive audit data" /></ListItem>
                        </List>
                    </Paper>
                </Box>
            )
        },
        {
            id: 'risk-management-detailed',
            title: 'Risk Management Framework',
            icon: <Warning />,
            category: 'risk',
            keywords: ['risk assessment', 'risk register', 'kri', 'risk scoring'],
            content: (
                <Box>
                    <Typography variant="h6" gutterBottom>Comprehensive Risk Management</Typography>
                    <Typography paragraph>
                        Systematic approach to identifying, assessing, and managing organizational risks 
                        through structured processes and tools.
                    </Typography>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Risk Assessment Process</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Follow systematic approach to risk identification and assessment.
                            </Typography>
                            <List dense>
                                <ListItem><ListItemText primary="Risk identification workshops" /></ListItem>
                                <ListItem><ListItemText primary="Risk categorization and classification" /></ListItem>
                                <ListItem><ListItemText primary="Impact and likelihood assessment" /></ListItem>
                                <ListItem><ListItemText primary="Risk scoring and prioritization" /></ListItem>
                                <ListItem><ListItemText primary="Risk treatment planning" /></ListItem>
                            </List>
                            <Paper sx={{ p: 2, mt: 2, bgcolor: 'info.light' }}>
                                <Typography variant="subtitle2" gutterBottom>Risk Scoring Matrix:</Typography>
                                <Grid container spacing={1}>
                                    <Grid size={{ xs: 12, sm: 6 }}><ListItemText primary="• Critical (9-10): Immediate action required" /></Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}><ListItemText primary="• High (7-8): Significant risk exposure" /></Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}><ListItemText primary="• Medium (4-6): Moderate impact" /></Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}><ListItemText primary="• Low (1-3): Minor risk level" /></Grid>
                                </Grid>
                            </Paper>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Key Risk Indicators (KRIs)</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Monitor critical risk metrics with real-time indicators.
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>KRI Types:</Typography>
                                        <List dense>
                                            <ListItem><ListItemText primary="Financial metrics" /></ListItem>
                                            <ListItem><ListItemText primary="Operational indicators" /></ListItem>
                                            <ListItem><ListItemText primary="Compliance measures" /></ListItem>
                                            <ListItem><ListItemText primary="Strategic indicators" /></ListItem>
                                        </List>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Monitoring Features:</Typography>
                                        <List dense>
                                            <ListItem><ListItemText primary="Real-time data feeds" /></ListItem>
                                            <ListItem><ListItemText primary="Threshold alerts" /></ListItem>
                                            <ListItem><ListItemText primary="Trend analysis" /></ListItem>
                                            <ListItem><ListItemText primary="Automated reporting" /></ListItem>
                                        </List>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            )
        },
        {
            id: 'compliance-frameworks',
            title: 'Compliance Framework Management',
            icon: <Gavel />,
            category: 'compliance',
            keywords: ['compliance', 'frameworks', 'standards', 'controls', 'mapping'],
            content: (
                <Box>
                    <Typography variant="h6" gutterBottom>Compliance Frameworks and Standards</Typography>
                    <Typography paragraph>
                        Manage regulatory compliance through comprehensive framework mapping and control assessment.
                    </Typography>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Framework Library</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Access and implement various compliance frameworks.
                            </Typography>
                            <List dense>
                                <ListItem><ListItemText primary="COSO Internal Control Framework" /></ListItem>
                                <ListItem><ListItemText primary="COBIT Governance Framework" /></ListItem>
                                <ListItem><ListItemText primary="ISO 27001 Information Security" /></ListItem>
                                <ListItem><ListItemText primary="SOX Financial Controls" /></ListItem>
                                <ListItem><ListItemText primary="GDPR Data Protection" /></ListItem>
                                <ListItem><ListItemText primary="Industry-specific regulations" /></ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Control Mapping and Assessment</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Map organizational controls to compliance requirements.
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Mapping Process:</Typography>
                                        <List dense>
                                            <ListItem><ListItemText primary="Control identification" /></ListItem>
                                            <ListItem><ListItemText primary="Framework alignment" /></ListItem>
                                            <ListItem><ListItemText primary="Gap analysis" /></ListItem>
                                            <ListItem><ListItemText primary="Coverage assessment" /></ListItem>
                                        </List>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Assessment Types:</Typography>
                                        <List dense>
                                            <ListItem><ListItemText primary="Design effectiveness" /></ListItem>
                                            <ListItem><ListItemText primary="Operating effectiveness" /></ListItem>
                                            <ListItem><ListItemText primary="Control testing" /></ListItem>
                                            <ListItem><ListItemText primary="Continuous monitoring" /></ListItem>
                                        </List>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            )
        },
        {
            id: 'reporting-suite',
            title: 'Advanced Reporting Suite',
            icon: <Assessment />,
            category: 'reports',
            keywords: ['reports', 'analytics', 'dashboards', 'insights'],
            content: (
                <Box>
                    <Typography variant="h6" gutterBottom>Comprehensive Reporting and Analytics</Typography>
                    <Typography paragraph>
                        Generate detailed reports with advanced analytics and customizable dashboards.
                    </Typography>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Report Types and Formats</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Standard Reports:</Typography>
                                        <List dense>
                                            <ListItem><ListItemText primary="Executive summaries" /></ListItem>
                                            <ListItem><ListItemText primary="Detailed audit reports" /></ListItem>
                                            <ListItem><ListItemText primary="Compliance status reports" /></ListItem>
                                            <ListItem><ListItemText primary="Risk assessment reports" /></ListItem>
                                        </List>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Custom Reports:</Typography>
                                        <List dense>
                                            <ListItem><ListItemText primary="User-defined templates" /></ListItem>
                                            <ListItem><ListItemText primary="Dynamic filtering" /></ListItem>
                                            <ListItem><ListItemText primary="Scheduled generation" /></ListItem>
                                            <ListItem><ListItemText primary="Multiple export formats" /></ListItem>
                                        </List>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">Analytics and Dashboards</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography paragraph>
                                Interactive dashboards with real-time analytics and insights.
                            </Typography>
                            <List dense>
                                <ListItem><ListItemText primary="Audit performance metrics" /></ListItem>
                                <ListItem><ListItemText primary="Risk trend analysis" /></ListItem>
                                <ListItem><ListItemText primary="Compliance status tracking" /></ListItem>
                                <ListItem><ListItemText primary="Resource utilization" /></ListItem>
                                <ListItem><ListItemText primary="Finding remediation progress" /></ListItem>
                            </List>
                            <Alert severity="info" sx={{ mt: 1 }}>
                                <Typography variant="body2">
                                    All reports include risk analysis and control mapping sections when applicable.
                                </Typography>
                            </Alert>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            )
        },
        {
            id: 'support',
            title: 'Support and Contact',
            icon: <HelpOutline />,
            category: 'support',
            keywords: ['support', 'contact', 'help', 'issue', 'problem'],
            content: (
                <Box>
                    <Typography variant="h6" gutterBottom>Get Help and Support</Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Email color="primary" sx={{ fontSize: 40, mb: 1 }} />
                                    <Typography variant="h6" gutterBottom>Email Support</Typography>
                                    <Typography variant="body2" paragraph>
                                        Get help via email for non-urgent issues.
                                    </Typography>
                                    <Button variant="outlined" fullWidth>
                                        support@auditsoft.com
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Phone color="primary" sx={{ fontSize: 40, mb: 1 }} />
                                    <Typography variant="h6" gutterBottom>Phone Support</Typography>
                                    <Typography variant="body2" paragraph>
                                        Call us for immediate assistance during business hours.
                                    </Typography>
                                    <Button variant="outlined" fullWidth>
                                        1-800-AUDIT-HELP
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <QuestionAnswer color="primary" sx={{ fontSize: 40, mb: 1 }} />
                                    <Typography variant="h6" gutterBottom>Live Chat</Typography>
                                    <Typography variant="body2" paragraph>
                                        Chat with our support team in real-time.
                                    </Typography>
                                    <Button variant="outlined" fullWidth>
                                        Start Chat
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                    <Alert severity="info" sx={{ mt: 3 }}>
                        <Typography variant="body2">
                            <strong>Business Hours:</strong> Monday - Friday, 8:00 AM - 6:00 PM EST
                        </Typography>
                    </Alert>
                </Box>
            )
        }
    ], []);

    const filteredSections = useMemo(() => {
        if (!searchTerm) return helpSections;
        
        const lowerSearchTerm = searchTerm.toLowerCase();
        return helpSections.filter(section => 
            section.title.toLowerCase().includes(lowerSearchTerm) ||
            section.keywords.some(keyword => keyword.toLowerCase().includes(lowerSearchTerm)) ||
            section.category.toLowerCase().includes(lowerSearchTerm)
        );
    }, [searchTerm, helpSections]);

    const categories = useMemo(() => ['general', 'audits', 'risk', 'compliance', 'reports', 'roles', 'system', 'support'], []);

    const sectionsByCategory = useMemo(() => {
        const grouped: Record<string, typeof helpSections> = {};
        categories.forEach(cat => {
            grouped[cat] = filteredSections.filter(section => section.category === cat);
        });
        return grouped;
    }, [filteredSections, categories]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    <HelpOutline sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Auditsoft Help Center
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Your comprehensive guide to using Auditsoft effectively. Find answers, learn best practices, and get the most out of your audit management system.
                </Typography>
                
                <TextField
                    fullWidth
                    placeholder="Search for help topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {categories.map(category => (
                        <Chip
                            key={category}
                            label={category.charAt(0).toUpperCase() + category.slice(1)}
                            onClick={() => setSearchTerm(category)}
                            variant="outlined"
                            size="small"
                        />
                    ))}
                </Box>

                <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
                    <Tab label="All Topics" />
                    <Tab label="Quick Start" />
                    <Tab label="Contact Support" />
                </Tabs>
            </Paper>

            <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                    {categories.map(category => (
                        sectionsByCategory[category].length > 0 && (
                            <Grid size={{ xs: 12 }} key={category}>
                                <Typography variant="h5" gutterBottom sx={{ textTransform: 'capitalize' }}>
                                    {category} Help
                                </Typography>
                                {sectionsByCategory[category].map(section => (
                                    <Card key={section.id} sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                {section.icon}
                                                <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                                                    {section.title}
                                                </Typography>
                                                <IconButton 
                                                    onClick={() => toggleBookmark(section.id)}
                                                    color="primary"
                                                >
                                                    {bookmarkedSections.includes(section.id) ? <Bookmark /> : <BookmarkBorder />}
                                                </IconButton>
                                            </Box>
                                            {section.content}
                                        </CardContent>
                                    </Card>
                                ))}
                            </Grid>
                        )
                    ))}
                </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <Typography variant="h5" gutterBottom>Quick Start Guide</Typography>
                <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        New to Auditsoft? Follow these steps to get started quickly.
                    </Typography>
                </Alert>
                <Paper sx={{ p: 2 }}>
                    <List>
                        <ListItem>
                            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                            <ListItemText 
                                primary="Step 1: Explore Your Dashboard" 
                                secondary="Familiarize yourself with the main interface and navigation."
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                            <ListItemText 
                                primary="Step 2: Review Your Profile" 
                                secondary="Update your profile information and notification preferences."
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                            <ListItemText 
                                primary="Step 3: Check Assigned Tasks" 
                                secondary="Review your assigned audits and action items."
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                            <ListItemText 
                                primary="Step 4: Explore Key Features" 
                                secondary="Try creating a test audit or exploring existing data."
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                            <ListItemText 
                                primary="Step 5: Get Help" 
                                secondary="Use this help center or contact support if you need assistance."
                            />
                        </ListItem>
                    </List>
                </Paper>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                <Typography variant="h5" gutterBottom>Contact Support</Typography>
                <Card>
                    <CardContent>
                        {helpSections.find(section => section.id === 'support')?.content}
                    </CardContent>
                </Card>
            </TabPanel>
        </Box>
    );
};

export default HelpPage;
