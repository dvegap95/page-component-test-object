import React from 'react';
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';

export function MuiPlayground() {
  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState('');
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 360, p: 2 }}>
      <TextField
        label="Name"
        placeholder="Enter name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={name.length > 0 && name.length < 3}
        helperText={name.length > 0 && name.length < 3 ? 'At least 3 characters' : ' '}
      />

      <TextField
        select
        label="Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <MenuItem value="viewer">Viewer</MenuItem>
        <MenuItem value="editor">Editor</MenuItem>
        <MenuItem value="admin">Admin</MenuItem>
      </TextField>

      <TextField
        label="Shift start"
        type="time"
        inputProps={{ 'aria-label': 'Shift start' }}
        defaultValue="09:00"
        InputLabelProps={{ shrink: true }}
      />

      <Button variant="contained" onClick={() => setSnackbarOpen(true)}>
        Save
      </Button>

      <Table size="small" aria-label="team members">
        <TableHead>
          <TableRow>
            <TableCell component="th" scope="col" id="col-name">
              Name
            </TableCell>
            <TableCell component="th" scope="col" id="col-role">
              Role
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell headers="col-name">Ada</TableCell>
            <TableCell headers="col-role">Editor</TableCell>
          </TableRow>
          <TableRow>
            <TableCell headers="col-name">Lin</TableCell>
            <TableCell headers="col-role">Viewer</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Snackbar open={snackbarOpen} onClose={() => setSnackbarOpen(false)}>
        <Alert severity="success" variant="filled">
          Saved successfully
        </Alert>
      </Snackbar>
    </Box>
  );
}
