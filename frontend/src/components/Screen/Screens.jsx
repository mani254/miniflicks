import {
  Boxes,
  Clock,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Tv,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "sonner";

import { catalogApi } from "../../api/catalog";
import { useAuth } from "../../hooks/useAuth";
import { getImageUrl } from "../../lib/imageUrl";
import LocationOptions from "../Locations/LocationOptions.jsx";
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
function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-14 h-14 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
        <Tv className="w-6 h-6 text-gray-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">No screens found</p>
        <p className="text-xs text-gray-400 mt-1">
          Add theater screens, seating capacity, and time slots.
        </p>
      </div>
      <Button size="sm" onClick={onAdd}>
        <Plus className="w-4 h-4" /> Add Screen
      </Button>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────── */
function Screens() {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const {
    screens: allScreens = [],
    loading,
    refetch,
  } = useOutletContext() || {};

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [screens, setScreens] = useState([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    if (!selectedLocation) {
      setScreens(allScreens);
    } else {
      const filtered = allScreens.filter((screen) => {
        const locId =
          typeof screen.location === "object"
            ? screen.location?._id
            : screen.location;
        return locId === selectedLocation;
      });
      setScreens(filtered);
    }
  }, [selectedLocation, allScreens]);

  function handleLocationFilter(e) {
    setSelectedLocation(e.target.value || null);
  }

  function openDelete(screen) {
    setSelected(screen);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!selected) return;
    setDeleting(true);
    try {
      await catalogApi.deleteScreen(selected._id);
      toast.success("Screen deleted successfully");
      refetch?.();
      setDeleteOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to delete screen");
    } finally {
      setDeleting(false);
    }
  }

  async function handleStatusChange(screen) {
    setTogglingId(screen._id);
    const updatedStatus = !screen.status;
    try {
      await catalogApi.changeScreenStatus(screen._id, updatedStatus);
      toast.success(`Screen ${updatedStatus ? "activated" : "deactivated"}`);
      refetch?.();
    } catch (err) {
      toast.error(err.message || "Failed to update screen status");
    } finally {
      setTogglingId(null);
    }
  }

  const totalActive = screens.filter((s) => s.status).length;
  const totalInactive = screens.length - totalActive;

  return (
    <>
      <div className="p-6 space-y-5">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Screens</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage private theater auditoriums, seating rules, and packages.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {admin?.superAdmin && (
              <div className="w-48">
                <LocationOptions
                  value={selectedLocation}
                  changeHandler={handleLocationFilter}
                  all={true}
                />
              </div>
            )}
            <Button onClick={() => navigate("/admin/screens/add")}>
              <Plus className="w-4 h-4" />
              Add Screen
            </Button>
          </div>
        </div>

        {/* ── Stat pills ── */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white">
            <span className="text-sm font-semibold text-gray-800">
              {screens.length}
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
                <p className="text-sm text-gray-500">Loading screens…</p>
              </div>
            </div>
          ) : screens.length === 0 ? (
            <EmptyState onAdd={() => navigate("/admin/screens/add")} />
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
                      Screen Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Extra Person
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Slots & Pkgs
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
                  {screens.map((screen, index) => {
                    const firstImage =
                      Array.isArray(screen.images) && screen.images.length > 0
                        ? screen.images[0]
                        : null;
                    const locationName =
                      typeof screen.location === "object"
                        ? screen.location?.name
                        : "Branch";

                    const slotsCount = Array.isArray(screen.slots)
                      ? screen.slots.length
                      : 0;
                    const pkgsCount = Array.isArray(screen.packages)
                      ? screen.packages.length
                      : 0;

                    return (
                      <tr
                        key={screen._id}
                        className="hover:bg-gray-50 transition-colors group"
                      >
                        {/* # */}
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                          {String(index + 1).padStart(2, "0")}
                        </td>

                        {/* Image Thumbnail */}
                        <td className="px-4 py-3">
                          <div className="w-12 h-10 rounded-md border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                            {firstImage ? (
                              <img
                                src={getImageUrl(firstImage)}
                                alt={screen.name}
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
                              style={{ display: firstImage ? "none" : "flex" }}
                            >
                              <ImageIcon className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900 block">
                            {screen.name}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {locationName || "Unallocated"}
                          </Badge>
                        </td>

                        {/* Capacity */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs text-gray-700">
                            <Users className="w-3.5 h-3.5 text-gray-400" />
                            <span>
                              {screen.minPeople} – {screen.capacity} people
                            </span>
                          </div>
                        </td>

                        {/* Extra Person Price */}
                        <td className="px-4 py-3 font-semibold text-gray-900 text-xs">
                          ₹{screen.extraPersonPrice || 0}/person
                        </td>

                        {/* Slots & Packages Counts */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] bg-gray-100 text-gray-700 font-mono">
                              <Clock className="w-3 h-3 text-gray-400" />
                              {slotsCount}
                            </span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] bg-blue-50 text-blue-700 font-mono border border-blue-100">
                              <Boxes className="w-3 h-3 text-blue-500" />
                              {pkgsCount}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {togglingId === screen._id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            ) : (
                              <Switch
                                checked={screen.status}
                                onCheckedChange={() =>
                                  handleStatusChange(screen)
                                }
                              />
                            )}
                            <span
                              className={`text-xs font-medium ${screen.status ? "text-emerald-600" : "text-gray-400"}`}
                            >
                              {screen.status ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                              onClick={() =>
                                navigate(`/admin/screens/edit/${screen._id}`)
                              }
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => openDelete(screen)}
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
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
            <DialogTitle>Delete Screen</DialogTitle>
            <DialogDescription className="mt-1">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-800">
                &quot;{selected?.name || "this screen"}&quot;
              </span>
              ? All historical slots and configurations linked to this
              auditorium will be removed.
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

export default Screens;
