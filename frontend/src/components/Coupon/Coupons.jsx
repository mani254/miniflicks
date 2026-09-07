import {
  Calendar,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Ticket,
  Trash2,
} from "lucide-react";
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
        <Ticket className="w-6 h-6 text-gray-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">No coupons yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Create promotional discount coupons for bookings.
        </p>
      </div>
      <Button size="sm" onClick={onAdd}>
        <Plus className="w-4 h-4" /> Add Coupon
      </Button>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────── */
function Coupons() {
  const navigate = useNavigate();
  const { coupons = [], loading, refetch } = useOutletContext() || {};

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  function openDelete(coupon) {
    setSelected(coupon);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!selected) return;
    setDeleting(true);
    try {
      await catalogApi.deleteCoupon(selected._id);
      toast.success("Coupon deleted successfully");
      refetch?.();
      setDeleteOpen(false);
    } catch (err) {
      toast.error(err.message || "Failed to delete coupon");
    } finally {
      setDeleting(false);
    }
  }

  async function handleStatusChange(coupon) {
    setTogglingId(coupon._id);
    const updatedStatus = !coupon.status;
    try {
      await catalogApi.updateCoupon(coupon._id, {
        ...coupon,
        status: updatedStatus,
      });
      toast.success(`Coupon ${updatedStatus ? "activated" : "deactivated"}`);
      refetch?.();
    } catch (err) {
      toast.error(err.message || "Failed to update coupon status");
    } finally {
      setTogglingId(null);
    }
  }

  const totalActive = coupons.filter((c) => c.status).length;
  const totalInactive = coupons.length - totalActive;

  return (
    <>
      <div className="p-6 space-y-5">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Coupons</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage promotional discounts and scrolling banner announcements.
            </p>
          </div>
          <Button onClick={() => navigate("/admin/coupons/add")}>
            <Plus className="w-4 h-4" />
            Add Coupon
          </Button>
        </div>

        {/* ── Stat pills ── */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white">
            <span className="text-sm font-semibold text-gray-800">
              {coupons.length}
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
                <p className="text-sm text-gray-500">Loading coupons…</p>
              </div>
            </div>
          ) : coupons.length === 0 ? (
            <EmptyState onAdd={() => navigate("/admin/coupons/add")} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
                      #
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Scroll Banner
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
                  {coupons.map((coupon, index) => {
                    const isExpired = new Date(coupon.expireDate) < new Date();
                    return (
                      <tr
                        key={coupon._id}
                        className="hover:bg-gray-50 transition-colors group"
                      >
                        {/* # */}
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                          {String(index + 1).padStart(2, "0")}
                        </td>

                        {/* Code */}
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className="font-mono text-xs font-semibold tracking-wider bg-gray-50 text-gray-900 border-gray-300"
                          >
                            {coupon.code}
                          </Badge>
                        </td>

                        {/* Discount */}
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {coupon.type === "percentage"
                            ? `${coupon.discount}%`
                            : `₹${coupon.discount}`}
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3">
                          <Badge
                            variant="secondary"
                            className="capitalize text-xs font-normal"
                          >
                            {coupon.type}
                          </Badge>
                        </td>

                        {/* Expiry Date */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span
                              className={
                                isExpired
                                  ? "text-red-600 font-medium"
                                  : "text-gray-600"
                              }
                            >
                              {new Date(coupon.expireDate).toLocaleDateString()}
                              {isExpired && " (Expired)"}
                            </span>
                          </div>
                        </td>

                        {/* Scroll Banner */}
                        <td className="px-4 py-3">
                          {coupon.scrollCoupon ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              <Sparkles className="w-3 h-3 text-blue-500" />
                              Active
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {togglingId === coupon._id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            ) : (
                              <Switch
                                checked={coupon.status}
                                onCheckedChange={() =>
                                  handleStatusChange(coupon)
                                }
                              />
                            )}
                            <span
                              className={`text-xs font-medium ${coupon.status ? "text-emerald-600" : "text-gray-400"}`}
                            >
                              {coupon.status ? "Active" : "Inactive"}
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
                                navigate(`/admin/coupons/edit/${coupon._id}`)
                              }
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => openDelete(coupon)}
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
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription className="mt-1">
              Are you sure you want to delete coupon{" "}
              <span className="font-mono font-semibold text-gray-800">
                &quot;{selected?.code}&quot;
              </span>
              ? Customers will no longer be able to apply this discount.
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

export default Coupons;
