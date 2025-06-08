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
  t
}) => {

  const handleMaxMembersChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (e.target.value === '' || (!isNaN(value))) {
      setMaxMembers(e.target.value === '' ? '' : Math.max(2, value));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        component: 'form',
        onSubmit: (e) => {
          e.preventDefault();
          handleCreateGroup();
        }
      }}
    >
      <DialogTitle>{t("Create Community Group")}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label={t("Group Name")}
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
          label={t("Group Description (Optional)")}
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
          label={t("Max Members (min 2)")}
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
          label={t("Password Protect?")}
        />
        {isPasswordProtected && (
          <TextField
            margin="dense"
            id="password"
            label={t("Password")}
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
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button variant="contained" type="submit">
          {t("Create")}
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
  t
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        component: 'form',
        onSubmit: (e) => {
          e.preventDefault();
          handleJoinGroup();
        }
      }}
    >
      <DialogTitle>
        {requiresPassword ? t('joinProtectedGroupTitle') : t('joinGroupTitle')}
      </DialogTitle>
      <DialogContent>
        {requiresPassword ? (
          <>
            <Typography sx={{ mb: 2 }}>
              {t('protectedGroupPrompt')}
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              id="join-password"
              label={t('passwordLabel')}
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
            {t('joinGroupPromptNoPassword')}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('Cancel')}</Button>
        <Button variant="contained" type="submit">
          {t('joinGroup')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};