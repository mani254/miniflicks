import {
  Gift as GiftIcon,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Trash2,
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
function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-14 h-14 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
        <GiftIcon className="w-6 h-6 text-gray-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">No gifts yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Add gift items like Chocolates, Teddy Bears, Bouquets.
        </p>
      </div>
      <Button size="sm" onClick={onAdd}>
        <Plus className="w-4 h-4" /> Add Gift
      </Button>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────── */
function Gifts() {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const { giftsData, refetch } = useOutletContext() || {};

  const gifts = giftsData?.gifts || [];
  const loading = giftsData?.loading;

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  function openDelete(gift) {
    setSelected(gift);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!selected) return;
    setDeleting(true);
    try {
      await catalogApi.deleteGift(selected._id);
      toast.success("Gift deleted successfully");
      refetch?.();
      setDeleteOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to delete gift");
    } finally {
      setDeleting(false);
    }
  }

  async function handleStatusChange(gift) {
    setTogglingId(gift._id);
    const updatedStatus = !gift.status;
    try {
      await catalogApi.updateGift(gift._id, { ...gift, status: updatedStatus });
      toast.success(`Gift ${updatedStatus ? "activated" : "deactivated"}`);
      refetch?.();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  }

  const totalActive = gifts.filter((g) => g.status !== false).length;
  const totalInactive = gifts.length - totalActive;

  return (
    <>
      <div className="p-6 space-y-5">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Gifts</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage gift items and celebration hampers available to add on
              bookings.
            </p>
          </div>
          <Button onClick={() => navigate("/admin/gifts/add")}>
            <Plus className="w-4 h-4" />
            Add Gift
          </Button>
        </div>

        {/* ── Stat pills ── */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white">
            <span className="text-sm font-semibold text-gray-800">
              {gifts.length}
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
                <p className="text-sm text-gray-500">Loading gifts…</p>
              </div>
            </div>
          ) : gifts.length === 0 ? (
            <EmptyState onAdd={() => navigate("/admin/gifts/add")} />
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
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Position
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
                  {gifts.map((gift, index) => (
                    <tr
                      key={gift._id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      {/* # */}
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                        {String(index + 1).padStart(2, "0")}
                      </td>

                      {/* Image Thumbnail */}
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                          {gift.image ? (
                            <img
                              src={getImageUrl(gift.image)}
                              alt={gift.name}
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
                            style={{ display: gift.image ? "none" : "flex" }}
                          >
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {gift.name}
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3 max-w-xs">
                        <span className="text-xs text-gray-500 truncate block">
                          {gift.description || "—"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        ₹{gift.price}
                      </td>

                      {/* Position */}
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="font-mono text-xs">
                          {gift.position ?? 0}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {togglingId === gift._id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          ) : (
                            <Switch
                              checked={gift.status !== false}
                              onCheckedChange={() => handleStatusChange(gift)}
                            />
                          )}
                          <span
                            className={`text-xs font-medium ${gift.status !== false ? "text-emerald-600" : "text-gray-400"}`}
                          >
                            {gift.status !== false ? "Active" : "Inactive"}
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
                              navigate(`/admin/gifts/edit/${gift._id}`)
                            }
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => openDelete(gift)}
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
            <DialogTitle>Delete Gift</DialogTitle>
            <DialogDescription className="mt-1">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-800">
                &quot;{selected?.name || "this gift"}&quot;
              </span>
              ? Customers will no longer be able to select it during booking.
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

export default Gifts;
