import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
} from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";

function CreateFriendGroupDialog({
  open,
  onClose,
  newFriendGroupName,
  setNewFriendGroupName,
  newFriendGroupDescription,
  setNewFriendGroupDescription,
  friendGroupPassword,
  setFriendGroupPassword,
  handleCreateFriendGroup,
  friends,
  t, 
}) {
  const [selectedFriends, setSelectedFriends] = useState([]);

  const handleFriendSelection = (event, friendId) => {
    if (event.target.checked) {
      setSelectedFriends([...selectedFriends, friendId]);
    } else {
      setSelectedFriends(selectedFriends.filter((id) => id !== friendId));
    }
  };

  const onCreateGroup = () => {
    handleCreateFriendGroup({
      groupName: newFriendGroupName,
      description: newFriendGroupDescription,
      password: friendGroupPassword,
      invitedFriends: selectedFriends,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t("createFriendGroupDialogTitle")}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="friendGroupName"
          label={t("friendGroupNameLabel")}
          type="text"
          fullWidth
          variant="standard"
          value={newFriendGroupName}
          onChange={(e) => setNewFriendGroupName(e.target.value)}
        />
        <TextField
          margin="dense"
          id="friendGroupDescription"
          label={t("friendGroupDescriptionLabel")}
          type="text"
          fullWidth
          variant="standard"
          multiline
          rows={2}
          value={newFriendGroupDescription}
          onChange={(e) => setNewFriendGroupDescription(e.target.value)}
        />
        <TextField
          margin="dense"
          id="friendGroupPassword"
          label={t("friendGroupPasswordOptionalLabel")}
          type="password"
          fullWidth
          variant="standard"
          value={friendGroupPassword}
          onChange={(e) => setFriendGroupPassword(e.target.value)}
        />
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          {t("inviteFriendsTitle")}
        </Typography>
        <List dense>
          {friends &&
            friends.map((friend) => (
              <ListItem key={friend.id}>
                <ListItemAvatar>
                  <Avatar src={friend.profilePicture}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={friend.username || friend.name} />
                <ListItemSecondaryAction>
                  <FormControlLabel
                    control={
                      <Checkbox
                        edge="end"
                        onChange={(event) =>
                          handleFriendSelection(event, friend.id)
                        }
                        value={friend.id}
                        inputProps={{
                          "aria-labelledby": `checkbox-list-secondary-label-${friend.id}`,
                        }}
                      />
                    }
                    label={t("inviteCheckboxLabel")}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          {!friends || friends.length === 0 ? (
            <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
              {t("noFriendsToInviteMessage")}
            </Typography>
          ) : null}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button onClick={onCreateGroup} variant="contained" color="warning">
          {t("createFriendGroupButtonLabel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateFriendGroupDialog;
