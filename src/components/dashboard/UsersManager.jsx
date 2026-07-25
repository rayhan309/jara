"use client";

import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Save, Trash2, UserCog, X } from "lucide-react";
import toast from "react-hot-toast";
import { ADMIN_ROLE_OPTIONS, getRoleLabel } from "@/lib/adminRoles";
import {
  useAdminUsers,
  useCreateAdminUser,
  useDeleteAdminUser,
  useUpdateAdminUser,
} from "@/hooks/useAdminUsers";
import { getAdminAuth } from "@/lib/auth";
import DashPageHeader from "@/components/dashboard/DashPageHeader";

const inputClass =
  "w-full rounded-md border border-dash-border bg-white px-3 py-2.5 text-sm text-dash-text outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

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
      <div className="dash-card flex min-h-[280px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="dash-card border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">{error?.message || "Failed to load users."}</p>
        <button type="button" onClick={() => refetch()} className="mt-3 text-sm font-semibold text-indigo-600">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashPageHeader
        eyebrow="Admin"
        title="User Management"
        description="Add and manage Super Admin, Shop Manager, and Moderator accounts."
        action={
          <button
            type="button"
            onClick={() => setShowForm((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        }
      />

      {showForm ? (
        <form onSubmit={handleCreate} className="dash-card grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <label className="mb-1 block text-xs font-semibold text-dash-muted">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-dash-muted">Display Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className={inputClass}
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-dash-muted">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              className={inputClass}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-dash-muted">Role</label>
            <select
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
              className={inputClass}
            >
              {ADMIN_ROLE_OPTIONS.filter((role) => role.value !== "super_admin").map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex items-center gap-2 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Create User
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border border-dash-border px-4 py-2.5 text-sm font-semibold text-dash-text"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {editingUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleEditSubmit}
            className="dash-card w-full max-w-md space-y-4 p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-dash-text">Edit User</h2>
                <p className="text-sm text-dash-muted">@{editingUser.username}</p>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-md p-1 text-dash-muted hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-dash-muted">Display Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-dash-muted">Role</label>
              <select
                value={editForm.role}
                onChange={(event) => setEditForm((prev) => ({ ...prev, role: event.target.value }))}
                className={inputClass}
                disabled={editingUser.role === "super_admin"}
              >
                {ADMIN_ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-dash-muted">
                New Password (optional)
              </label>
              <input
                type="password"
                value={editForm.password}
                onChange={(event) => setEditForm((prev) => ({ ...prev, password: event.target.value }))}
                className={inputClass}
                placeholder="Leave blank to keep current password"
                minLength={6}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center gap-2 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
              <button
                type="button"
                onClick={closeEdit}
                className="border border-dash-border px-4 py-2.5 text-sm font-semibold text-dash-text"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="dash-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-dash-border bg-slate-50 text-[11px] font-semibold tracking-wide text-dash-muted uppercase">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => {
                const isSelf = auth?.userId === user._id;
                return (
                  <tr key={user._id} className="border-b border-dash-border last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
                          <UserCog className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-dash-text">{user.name}</p>
                          <p className="text-xs text-dash-muted">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-dash-text">{getRoleLabel(user.role)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${
                          user.active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => openEdit(user)}
                          className="inline-flex items-center gap-1 rounded-md border border-dash-border px-3 py-1.5 text-xs font-semibold text-dash-text hover:bg-slate-50 disabled:opacity-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={isSelf || isUpdating}
                          onClick={() => toggleActive(user)}
                          className="rounded-md border border-dash-border px-3 py-1.5 text-xs font-semibold text-dash-text hover:bg-slate-50 disabled:opacity-50"
                        >
                          {user.active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          disabled={isSelf || isDeleting}
                          onClick={() => handleDelete(user)}
                          className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-md border border-dash-border bg-slate-50 px-4 py-3 text-xs text-dash-muted">
        <p className="font-semibold text-dash-text">Role permissions</p>
        <ul className="mt-2 space-y-1">
          <li>Super Admin — full access + user management</li>
          <li>Shop Manager — products, categories, customers</li>
          <li>Moderator — orders only</li>
        </ul>
      </div>
    </div>
  );
}
