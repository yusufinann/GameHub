// UpdateFriendGroupDialog.jsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Button,
    InputAdornment,
    IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

function UpdateFriendGroupDialog({ open, onClose, group, onUpdate }) {
    const [groupName, setGroupName] = useState('');
    const [description, setDescription] = useState('');
    const [password, setPassword] = useState('');
    const [maxMembers, setMaxMembers] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (group) {
            setGroupName(group.groupName || '');
            setDescription(group.description || '');
            setPassword(''); // Don't prefill password for security/UX
            setMaxMembers(group.maxMembers || '');
        }
    }, [group]);

    const handleUpdateClick = () => {
        const updates = {};
        if (groupName !== group?.groupName) updates.groupName = groupName;
        if (description !== group?.description) updates.description = description;
        // Only include password if it's changed (not empty)
        if (password) updates.password = password;
        // Only include maxMembers if it's changed and a valid number
        const newMaxMembers = parseInt(maxMembers, 10);
        if (!isNaN(newMaxMembers) && newMaxMembers !== group?.maxMembers) {
             updates.maxMembers = newMaxMembers;
        } else if (maxMembers === '' && group?.maxMembers !== undefined) {
            // Allow clearing maxMembers if it was previously set
             updates.maxMembers = null; // Or handle appropriately on backend
        }


        if (Object.keys(updates).length > 0) {
             onUpdate(updates);
        }
        onClose(); // Close dialog regardless of whether updates were made
    };

     const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };


    if (!group) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Update Friend Group: {group.groupName}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="updateGroupName"
                    label="Friend Group Name"
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
                    label="Friend Group Description (Optional)"
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
                    label="New Password (Optional - leave blank to keep current)"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
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
                    label="Max Members (Optional)"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(e.target.value)}
                    InputProps={{ inputProps: { min: 2 } }} // Assuming min 2 members (host + 1)
                     sx={{ mb: 2 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleUpdateClick} variant="contained" color="warning">Update Group</Button>
            </DialogActions>
        </Dialog>
    );
}

export default UpdateFriendGroupDialog;