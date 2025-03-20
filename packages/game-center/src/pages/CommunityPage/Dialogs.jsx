import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

// Create New Group Dialog Component
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
  handleCreateGroup,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
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
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCreateGroup} variant="contained">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Join Group Dialog Component
export const JoinGroupDialog = ({
  open,
  onClose,
  joinPassword,
  setJoinPassword,
  handleJoinGroup,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Join Protected Group</DialogTitle>
      <DialogContent>
        <Typography>
          This group is password protected. Please enter the password to join.
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          id="password"
          label="Password"
          type="password"
          fullWidth
          variant="standard"
          value={joinPassword}
          onChange={(e) => setJoinPassword(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleJoinGroup} variant="contained">
          Join Group
        </Button>
      </DialogActions>
    </Dialog>
  );
};