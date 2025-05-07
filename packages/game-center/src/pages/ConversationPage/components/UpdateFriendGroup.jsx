// UpdateFriendGroupDialog.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

function UpdateFriendGroupDialog({ open, onClose, group, onUpdate, t }) {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [maxMembers, setMaxMembers] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (group) {
      setGroupName(group.groupName || "");
      setDescription(group.description || "");
      setPassword("");
      setMaxMembers(group.maxMembers || "");
    }
  }, [group]);

  const handleUpdateClick = () => {
    const updates = {};
    if (groupName !== group?.groupName) updates.groupName = groupName;
    if (description !== group?.description) updates.description = description;
    if (password) updates.password = password;
    const newMaxMembers = parseInt(maxMembers, 10);
    if (!isNaN(newMaxMembers) && newMaxMembers !== group?.maxMembers) {
      updates.maxMembers = newMaxMembers;
    } else if (maxMembers === "" && group?.maxMembers !== undefined) {
      updates.maxMembers = null;
    }

    if (Object.keys(updates).length > 0) {
      onUpdate(updates);
    }
    onClose();
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (!group) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {t("updateFriendGroupDialogTitle", { groupName: group.groupName })}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="updateGroupName"
          label={t("friendGroupNameLabel")}
          type="text"
          fullWidth
          variant="outlined"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          id="updateGroupDescription"
          label={t("friendGroupDescriptionLabel")}
          type="text"
          fullWidth
          variant="outlined"
          multiline
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          id="updateGroupPassword"
          label={t("newPasswordOptionalLabel")}
          type={showPassword ? "text" : "password"}
          fullWidth
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={t(
                    showPassword
                      ? "hidePasswordAriaLabel"
                      : "showPasswordAriaLabel"
                  )}
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          id="updateMaxMembers"
          label={t("maxMembersOptionalLabel")}
          type="number"
          fullWidth
          variant="outlined"
          value={maxMembers}
          onChange={(e) => setMaxMembers(e.target.value)}
          InputProps={{ inputProps: { min: 2 } }}
          sx={{ mb: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button onClick={handleUpdateClick} variant="contained" color="warning">
          {t("updateGroupButtonLabel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UpdateFriendGroupDialog;
