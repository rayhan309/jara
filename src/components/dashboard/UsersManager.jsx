"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { ADMIN_ROLE_OPTIONS, getRoleLabel } from "@/lib/adminRoles";
import {
  useAdminUsers,
  useCreateAdminUser,
  useDeleteAdminUser,
  useUpdateAdminUser,
} from "@/hooks/useAdminUsers";
import { getAdminAuth } from "@/lib/auth";
import DashPageHeader from "@/components/dashboard/DashPageHeader";

const emptyForm = {
  username: "",
  name: "",
  password: "",
  role: "shop_manager",
};

export default function UsersManager() {
  const auth = getAdminAuth();
  const { data: users = [], isLoading, isError, error, refetch } = useAdminUsers();
  const { mutate: createUser, isPending: isCreating } = useCreateAdminUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateAdminUser();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteAdminUser();

  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", role: "shop_manager", password: "" });

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.username.localeCompare(b.username)),
    [users]
  );

  function handleCreate(event) {
    event.preventDefault();

    createUser(form, {
      onSuccess: () => {
        toast.success("User created");
        setForm(emptyForm);
        setShowForm(false);
      },
      onError: (createError) => toast.error(createError.message || "Create failed"),
    });
  }

  function openEdit(user) {
    setEditingUser(user);
    setEditForm({
      name: user.name || user.username,
      role: user.role,
      password: "",
    });
  }

  function closeEdit() {
    setEditingUser(null);
    setEditForm({ name: "", role: "shop_manager", password: "" });
  }

  function handleEditSubmit(event) {
    event.preventDefault();

    const payload = {
      name: editForm.name.trim(),
      role: editForm.role,
    };

    if (editForm.password) {
      if (editForm.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      payload.password = editForm.password;
    }

    updateUser(
      { id: editingUser._id, payload },
      {
        onSuccess: () => {
          toast.success("User updated");
          closeEdit();
        },
        onError: (updateError) => toast.error(updateError.message || "Update failed"),
      }
    );
  }

  function toggleActive(user) {
    updateUser(
      { id: user._id, payload: { active: !user.active } },
      {
        onSuccess: () => toast.success(user.active ? "User deactivated" : "User activated"),
        onError: (updateError) => toast.error(updateError.message || "Update failed"),
      }
    );
  }

  function handleDelete(user) {
    if (!window.confirm(`Delete user "${user.username}"?`)) return;

    deleteUser(user._id, {
      onSuccess: () => toast.success("User deleted"),
      onError: (deleteError) => toast.error(deleteError.message || "Delete failed"),
    });
  }

  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{
          minHeight: 280,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: 1,
          borderColor: "divider",
        }}
      >
        <CircularProgress size={32} />
      </Paper>
    );
  }

  if (isError) {
    return (
      <Paper
        elevation={0}
        sx={{ p: 3, border: 1, borderColor: "error.light", bgcolor: "error.50", textAlign: "center" }}
      >
        <Typography variant="body2" color="error">
          {error?.message || "Failed to load users."}
        </Typography>
        <Button onClick={() => refetch()} sx={{ mt: 1.5 }}>
          Try again
        </Button>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      <DashPageHeader
        eyebrow="Admin"
        title="User Management"
        description="Add and manage Super Admin, Shop Manager, and Moderator accounts."
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setShowForm((prev) => !prev)}
          >
            Add User
          </Button>
        }
      />

      {showForm ? (
        <Paper
          component="form"
          onSubmit={handleCreate}
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            border: 1,
            borderColor: "divider",
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          }}
        >
          <TextField
            fullWidth
            required
            label="Username"
            value={form.username}
            onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
          />
          <TextField
            fullWidth
            label="Display Name"
            placeholder="Optional"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <TextField
            fullWidth
            required
            type="password"
            label="Password"
            inputProps={{ minLength: 6 }}
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          />
          <FormControl fullWidth>
            <InputLabel id="create-user-role-label">Role</InputLabel>
            <Select
              labelId="create-user-role-label"
              label="Role"
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
            >
              {ADMIN_ROLE_OPTIONS.filter((role) => role.value !== "super_admin").map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1} sx={{ gridColumn: { sm: "1 / -1" } }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isCreating}
              startIcon={
                isCreating ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />
              }
            >
              Create User
            </Button>
            <Button variant="outlined" color="inherit" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </Stack>
        </Paper>
      ) : null}

      <Dialog open={Boolean(editingUser)} onClose={closeEdit} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          <Box>
            <Typography component="span" variant="h6" fontWeight={700} display="block">
              Edit User
            </Typography>
            {editingUser ? (
              <Typography variant="body2" color="text.secondary">
                @{editingUser.username}
              </Typography>
            ) : null}
          </Box>
          <IconButton aria-label="Close" onClick={closeEdit} size="small">
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Box component="form" onSubmit={handleEditSubmit}>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                required
                label="Display Name"
                value={editForm.name}
                onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
              />
              <FormControl fullWidth disabled={editingUser?.role === "super_admin"}>
                <InputLabel id="edit-user-role-label">Role</InputLabel>
                <Select
                  labelId="edit-user-role-label"
                  label="Role"
                  value={editForm.role}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, role: event.target.value }))}
                >
                  {ADMIN_ROLE_OPTIONS.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                type="password"
                label="New Password (optional)"
                placeholder="Leave blank to keep current password"
                inputProps={{ minLength: 6 }}
                value={editForm.password}
                onChange={(event) => setEditForm((prev) => ({ ...prev, password: event.target.value }))}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={closeEdit} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isUpdating}
              startIcon={
                isUpdating ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />
              }
            >
              Save
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Paper elevation={0} sx={{ overflow: "hidden", border: 1, borderColor: "divider" }}>
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedUsers.map((user) => {
                const isSelf = auth?.userId === user._id;
                return (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "primary.50",
                            color: "primary.main",
                          }}
                        >
                          <ManageAccountsOutlinedIcon sx={{ fontSize: 18 }} />
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{user.username}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{getRoleLabel(user.role)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={user.active ? "success" : "default"}
                        label={user.active ? "Active" : "Inactive"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                        <Button
                          size="small"
                          variant="outlined"
                          color="inherit"
                          disabled={isUpdating}
                          startIcon={<EditOutlinedIcon />}
                          onClick={() => openEdit(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="inherit"
                          disabled={isSelf || isUpdating}
                          onClick={() => toggleActive(user)}
                        >
                          {user.active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          disabled={isSelf || isDeleting}
                          startIcon={<DeleteOutlineRoundedIcon />}
                          onClick={() => handleDelete(user)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      <Alert severity="info" variant="outlined" icon={false}>
        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
          Role permissions
        </Typography>
        <Typography variant="caption" component="div" color="text.secondary">
          Super Admin — full access + user management
        </Typography>
        <Typography variant="caption" component="div" color="text.secondary">
          Shop Manager — products, categories, customers
        </Typography>
        <Typography variant="caption" component="div" color="text.secondary">
          Moderator — orders only
        </Typography>
      </Alert>
    </Stack>
  );
}
