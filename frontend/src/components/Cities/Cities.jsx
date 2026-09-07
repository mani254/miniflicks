import { Building2, Loader2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "sonner";

import { catalogApi } from "../../api/catalog.js";
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
        <Building2 className="w-6 h-6 text-gray-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">No cities yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Add your first city to allocate theater locations.
        </p>
      </div>
      <Button size="sm" onClick={onAdd}>
        <Plus className="w-4 h-4" /> Add City
      </Button>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────── */
function Cities() {
  const navigate = useNavigate();
  const { cities = [], loading, refetch } = useOutletContext() || {};

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  function openDelete(city) {
    setSelected(city);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!selected) return;
    setDeleting(true);
    try {
      await catalogApi.deleteCity(selected._id);
      toast.success("City deleted successfully");
      refetch?.();
      setDeleteOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to delete city");
    } finally {
      setDeleting(false);
    }
  }

  async function handleStatusChange(city) {
    setTogglingId(city._id);
    const updatedStatus = !city.status;
    try {
      await catalogApi.updateCity(city._id, { ...city, status: updatedStatus });
      toast.success(`City ${updatedStatus ? "activated" : "deactivated"}`);
      refetch?.();
    } catch (err) {
      toast.error(err.message || "Failed to update city status");
    } finally {
      setTogglingId(null);
    }
  }

  const totalActive = cities.filter((c) => c.status).length;
  const totalInactive = cities.length - totalActive;

  return (
    <>
      <div className="p-6 space-y-5">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Cities</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage supported cities for theater branches.
            </p>
          </div>
          <Button onClick={() => navigate("/admin/cities/add")}>
            <Plus className="w-4 h-4" />
            Add City
          </Button>
        </div>

        {/* ── Stat pills ── */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white">
            <span className="text-sm font-semibold text-gray-800">
              {cities.length}
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
                <p className="text-sm text-gray-500">Loading cities…</p>
              </div>
            </div>
          ) : cities.length === 0 ? (
            <EmptyState onAdd={() => navigate("/admin/cities/add")} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
                      #
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      City Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Locations
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
                  {cities.map((city, index) => {
                    const locCount = Array.isArray(city.locations)
                      ? city.locations.length
                      : 0;
                    return (
                      <tr
                        key={city._id}
                        className="hover:bg-gray-50 transition-colors group"
                      >
                        {/* # */}
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                          {String(index + 1).padStart(2, "0")}
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                              <MapPin className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-medium text-gray-800">
                              {city.name}
                            </span>
                          </div>
                        </td>

                        {/* Locations Count */}
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className="font-mono text-xs text-gray-600"
                          >
                            {locCount} {locCount === 1 ? "branch" : "branches"}
                          </Badge>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {togglingId === city._id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            ) : (
                              <Switch
                                checked={city.status}
                                onCheckedChange={() => handleStatusChange(city)}
                              />
                            )}
                            <span
                              className={`text-xs font-medium ${city.status ? "text-emerald-600" : "text-gray-400"}`}
                            >
                              {city.status ? "Active" : "Inactive"}
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
                                navigate(`/admin/cities/edit/${city._id}`)
                              }
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => openDelete(city)}
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
            <DialogTitle>Delete City</DialogTitle>
            <DialogDescription className="mt-1">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-800">
                &quot;{selected?.name || "this city"}&quot;
              </span>
              ? All locations allocated to this city will become unallocated.
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

export default Cities;
