import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@mui/material";

export const CreateGroupDialog = ({
  open,
  onClose,
  newGroupName,
  setNewGroupName,
  newGroupDescription,
  setNewGroupDescription,
  isPasswordProtected,
  setIsPasswordProtected,
  newGroupPassword,
  setNewGroupPassword,
  maxMembers, 
  setMaxMembers,
  handleCreateGroup,
}) => {

  const handleMaxMembersChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (e.target.value === '' || (!isNaN(value))) {
       setMaxMembers(e.target.value === '' ? '' : Math.max(2, value));
    }
  };


  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ component: 'form', onSubmit: (e) => { e.preventDefault(); handleCreateGroup(); } }}>
      <DialogTitle>Create New Gaming Group</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Group Name"
          type="text"
          fullWidth
          variant="standard"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          required 
        />
        <TextField
          margin="dense"
          id="description"
          label="Group Description (Optional)"
          type="text"
          fullWidth
          variant="standard"
          multiline
          rows={2}
          value={newGroupDescription}
          onChange={(e) => setNewGroupDescription(e.target.value)}
        />
         <TextField
            margin="dense"
            id="maxMembers"
            label="Max Members (min 2)"
            type="number"
            fullWidth
            variant="standard"
            value={maxMembers}
            onChange={handleMaxMembersChange}
            InputProps={{ inputProps: { min: 2 } }} 
            required 
            helperText={maxMembers !== '' && Number(maxMembers) < 2 ? "Minimum 2 members required" : ""}
            error={maxMembers !== '' && Number(maxMembers) < 2}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={isPasswordProtected}
              onChange={(e) => setIsPasswordProtected(e.target.checked)}
            />
          }
          label="Password Protect?"
        />
        {isPasswordProtected && (
          <TextField
            margin="dense"
            id="password"
            label="Password"
            type="password"
            fullWidth
            variant="standard"
            value={newGroupPassword}
            onChange={(e) => setNewGroupPassword(e.target.value)}
            required={isPasswordProtected}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCreateGroup} variant="contained" type="submit">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const JoinGroupDialog = ({
  open,
  onClose,
  joinPassword,
  setJoinPassword,
  handleJoinGroup,
  requiresPassword, 
}) => {
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ component: 'form', onSubmit: (e) => { e.preventDefault(); handleJoinGroup(); } }}>
       <DialogTitle>{requiresPassword ? "Join Protected Group" : "Join Group"}</DialogTitle>
      <DialogContent>
        {requiresPassword ? (
          <>
            <Typography>
              This group is password protected. Please enter the password to join.
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              id="join-password" 
              label="Password"
              type="password"
              fullWidth
              variant="standard"
              value={joinPassword}
              onChange={(e) => setJoinPassword(e.target.value)}
              required
            />
          </>
        ) : (
          <Typography>
            Click "Join Group" to become a member.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleJoinGroup} variant="contained" type="submit">
          Join Group
        </Button>
      </DialogActions>
    </Dialog>
  );
};