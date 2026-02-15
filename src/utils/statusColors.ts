export const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
        // Audit Lifecycle
        case 'Planned':
            return 'primary';
        case 'Approved':
            return 'info';
        case 'In Progress':
            return 'warning';
        case 'Under Review':
            return 'secondary';
        case 'Execution Finished':
            return 'info';
        case 'Pending CAE Approval':
            return 'warning';
        case 'Finalized':
            return 'success';
        case 'Closed':
            return 'success';
        case 'Completed':
            return 'success';

        // Finding Lifecycle
        case 'Identified':
            return 'info';
        case 'Validated':
            return 'primary';
        case 'Action Assigned':
            return 'secondary';
        case 'Remediation In Progress':
            return 'warning';
        case 'Verified':
            return 'info';
        // Finding Close matches Audit Close

        // Evidence Lifecycle
        case 'Uploaded':
            return 'default';
        case 'Reviewed':
            return 'info';
        case 'Archived':
            return 'default';

        // Generic/Fallback
        case 'Pending Approval':
            return 'warning';
        case 'Process Owner Review':
            return 'info';
        case 'Reviewed by Owner':
            return 'success';
        case 'Rejected':
            return 'error';
        default:
            return 'default';
    }
};

export const getStatusHexColor = (status: string): string => {
    const colorType = getStatusColor(status);
    switch (colorType) {
        case 'primary':
            return '#1976d2';
        case 'secondary':
            return '#9c27b0';
        case 'info':
            return '#0288d1';
        case 'warning':
            return '#ed6c02';
        case 'success':
            return '#2e7d32';
        case 'error':
            return '#d32f2f';
        default:
            return '#757575';
    }
};
