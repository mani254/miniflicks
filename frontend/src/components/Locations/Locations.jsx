import {
  ExternalLink,
  ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "sonner";

import { catalogApi } from "../../api/catalog";
import { useAuth } from "../../hooks/useAuth";
import { getImageUrl } from "../../lib/imageUrl";
import { Badge } from "../ui/badge.jsx";
import { Button } from "../ui/button.jsx";
import { Card } from "../ui/card.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog.jsx";
import { Switch } from "../ui/switch.jsx";

/* ─── Empty state ───────────────────────────────────────────────────── */
function EmptyState({ isSuperAdmin, onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-14 h-14 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
        <MapPin className="w-6 h-6 text-gray-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">No locations found</p>
        <p className="text-xs text-gray-400 mt-1">
          {isSuperAdmin
            ? "Create your first theater branch location."
            : "No location assigned to your account."}
        </p>
      </div>
      {isSuperAdmin && (
        <Button size="sm" onClick={onAdd}>
          <Plus className="w-4 h-4" /> Add Location
        </Button>
      )}
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────── */
function Locations() {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const { locations = [], loading, refetch } = useOutletContext() || {};

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const isSuperAdmin = Boolean(admin?.superAdmin);

  function openDelete(location) {
    setSelected(location);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!selected) return;
    setDeleting(true);
    try {
      await catalogApi.deleteLocation(selected._id);
      toast.success("Location deleted successfully");
      refetch?.();
      setDeleteOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to delete location");
    } finally {
      setDeleting(false);
    }
  }

  async function handleStatusChange(loc) {
    setTogglingId(loc._id);
    const updatedStatus = !loc.status;
    try {
      await catalogApi.changeLocationStatus(loc._id, updatedStatus);
      toast.success(`Location ${updatedStatus ? "activated" : "deactivated"}`);
      refetch?.();
    } catch (err) {
      toast.error(err.message || "Failed to update location status");
    } finally {
      setTogglingId(null);
    }
  }

  const totalActive = locations.filter((l) => l.status).length;
  const totalInactive = locations.length - totalActive;

  return (
    <>
      <div className="p-6 space-y-5">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Locations</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isSuperAdmin
                ? "Manage theater branches and assigned branch managers."
                : "Manage your assigned branch location details."}
            </p>
          </div>
          {isSuperAdmin && (
            <Button onClick={() => navigate("/admin/locations/add")}>
              <Plus className="w-4 h-4" />
              Add Location
            </Button>
          )}
        </div>

        {/* ── Stat pills ── */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white">
            <span className="text-sm font-semibold text-gray-800">
              {locations.length}
            </span>
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-sm font-semibold text-gray-800">
              {totalActive}
            </span>
            <span className="text-xs text-gray-500">Active</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            <span className="text-sm font-semibold text-gray-800">
              {totalInactive}
            </span>
            <span className="text-xs text-gray-500">Inactive</span>
          </div>
        </div>

        {/* ── Table ── */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <p className="text-sm text-gray-500">Loading locations…</p>
              </div>
            </div>
          ) : locations.length === 0 ? (
            <EmptyState
              isSuperAdmin={isSuperAdmin}
              onAdd={() => navigate("/admin/locations/add")}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
                      #
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      City
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Admin Info
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {locations.map((location, index) => {
                    const adminName = location.admin?.name || "—";
                    const adminPhone =
                      location.admin?.phone || location.admin?.number || "—";
                    const adminEmail = location.admin?.email || "—";

                    const canEdit =
                      isSuperAdmin || location._id === admin?.locationId;
                    const canDelete = isSuperAdmin;

                    return (
                      <tr
                        key={location._id}
                        className="hover:bg-gray-50 transition-colors group"
                      >
                        {/* # */}
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                          {String(index + 1).padStart(2, "0")}
                        </td>

                        {/* Image Thumbnail */}
                        <td className="px-4 py-3">
                          <div className="w-14 h-10 rounded border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                            {location.image ? (
                              <img
                                src={getImageUrl(location.image)}
                                alt={location.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  e.currentTarget.nextSibling.style.display =
                                    "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className="w-full h-full items-center justify-center"
                              style={{
                                display: location.image ? "none" : "flex",
                              }}
                            >
                              <ImageIcon className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                        </td>

                        {/* Location Name & Address */}
                        <td className="px-4 py-3 max-w-xs">
                          <div className="space-y-0.5">
                            <span className="font-medium text-gray-900 block truncate">
                              {location.name}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <span
                                className="truncate max-w-[200px]"
                                title={location.address}
                              >
                                {location.address || "—"}
                              </span>
                              {location.addressLink && (
                                <a
                                  href={location.addressLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 inline-flex items-center"
                                  title="View on Google Maps"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* City Badge */}
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {location.city?.name || "Unallocated"}
                          </Badge>
                        </td>

                        {/* Admin Contact Details */}
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-gray-800 font-medium">
                              <User className="w-3 h-3 text-gray-400" />
                              <span className="truncate max-w-[140px]">
                                {adminName}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>{adminPhone}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="truncate max-w-[160px]">
                                {adminEmail}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Status Switch */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {togglingId === location._id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            ) : (
                              <Switch
                                checked={location.status}
                                onCheckedChange={() =>
                                  handleStatusChange(location)
                                }
                              />
                            )}
                            <span
                              className={`text-xs font-medium ${location.status ? "text-emerald-600" : "text-gray-400"}`}
                            >
                              {location.status ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                onClick={() =>
                                  navigate(
                                    `/admin/locations/edit/${location._id}`,
                                  )
                                }
                                title="Edit Location"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => openDelete(location)}
                                title="Delete Location"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* ── Delete dialog ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Location</DialogTitle>
            <DialogDescription className="mt-1 text-xs leading-relaxed text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                &quot;{selected?.name || "this location"}&quot;
              </span>
              ? All screens and records linked to this branch will be removed or
              unallocated. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Locations;
