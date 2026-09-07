import {
  ImageIcon,
  LayoutList,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "sonner";

import { catalogApi } from "../../api/catalog.js";
import { getImageUrl } from "../../lib/imageUrl.js";
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
        <LayoutList className="w-6 h-6 text-gray-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">No banners yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Add your first banner to get started.
        </p>
      </div>
      <Button size="sm" onClick={onAdd}>
        <Plus className="w-4 h-4" /> Add Banner
      </Button>
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────────────── */
function Banners() {
  const navigate = useNavigate();
  const { banners = [], loading, refetch } = useOutletContext() || {};

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  function openDelete(banner) {
    setSelected(banner);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!selected) return;
    setDeleting(true);
    try {
      await catalogApi.deleteBanner(selected._id);
      toast.success("Banner deleted");
      refetch?.();
      setDeleteOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to delete banner");
    } finally {
      setDeleting(false);
    }
  }

  async function handleStatusChange(banner) {
    setTogglingId(banner._id);
    try {
      await catalogApi.changeBannerStatus(banner._id, !banner.status);
      toast.success(`Banner ${!banner.status ? "activated" : "deactivated"}`);
      refetch?.();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  }

  const totalActive = banners.filter((b) => b.status).length;
  const totalInactive = banners.length - totalActive;

  return (
    <>
      <div className="p-6 space-y-5">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Banners</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage promotional banners.
            </p>
          </div>
          <Button onClick={() => navigate("/admin/banners/add")}>
            <Plus className="w-4 h-4" />
            Add Banner
          </Button>
        </div>

        {/* ── Stat pills ── */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white">
            <span className="text-sm font-semibold text-gray-800">
              {banners.length}
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
                <p className="text-sm text-gray-500">Loading…</p>
              </div>
            </div>
          ) : banners.length === 0 ? (
            <EmptyState onAdd={() => navigate("/admin/banners/add")} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">
                      #
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Link
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {banners.map((banner, index) => (
                    <tr
                      key={banner._id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      {/* # */}
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                        {String(index + 1).padStart(2, "0")}
                      </td>

                      {/* Image */}
                      <td className="px-4 py-3">
                        <div className="w-14 h-10 rounded border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                          {banner.image ? (
                            <img
                              src={getImageUrl(banner.image)}
                              alt={banner.title || "Banner"}
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
                            style={{ display: banner.image ? "none" : "flex" }}
                          >
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-800 truncate max-w-[160px] block">
                          {banner.title || "—"}
                        </span>
                      </td>

                      {/* Link */}
                      <td className="px-4 py-3">
                        {banner.link ? (
                          <span className="text-xs text-blue-600 font-mono truncate max-w-[180px] block">
                            {banner.link}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Position */}
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="font-mono text-xs">
                          {banner.position}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {togglingId === banner._id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          ) : (
                            <Switch
                              checked={banner.status}
                              onCheckedChange={() => handleStatusChange(banner)}
                            />
                          )}
                          <span
                            className={`text-xs font-medium ${banner.status ? "text-emerald-600" : "text-gray-400"}`}
                          >
                            {banner.status ? "Active" : "Inactive"}
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
                              navigate(`/admin/banners/edit/${banner._id}`)
                            }
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => openDelete(banner)}
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
            <DialogTitle>Delete Banner</DialogTitle>
            <DialogDescription className="mt-1">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-800">
                &quot;{selected?.title || "this banner"}&quot;
              </span>
              ? This cannot be undone.
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

export default Banners;
