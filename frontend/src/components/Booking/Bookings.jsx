import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Eye,
  Trash2,
  Tv,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Loader2,
  BookmarkCheck,
  IndianRupee,
} from "lucide-react";
import { toast } from "sonner";
import BookingsFilter from "./BookingsFilter";
import Pagination from "../Pagination/Pagination";
import { useBookings, useDeleteBooking } from "../../hooks/useBookings";
import { convert12Hours } from "../../utils/index.js";
import { Card } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { Badge } from "../ui/badge.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog.jsx";

function Bookings() {
  const [params, setParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(
    Number(params.get("page")) || 1
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  const limit = 20;
  const queryParams = { ...Object.fromEntries(params), limit: Number(params.get("limit")) || limit };
  const { data, isLoading } = useBookings(queryParams);
  const deleteBookingMutation = useDeleteBooking();

  const bookings = data?.bookings || [];
  const noOfDocuments = data?.totalDocuments || 0;

  // Stat counts based on current batch
  const bookedCount = bookings.filter((b) => b.status === "booked").length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const canceledCount = bookings.filter((b) => b.status === "canceled").length;

  const openDeleteDialog = (booking) => {
    setSelectedBooking(booking);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBooking) return;
    setDeleting(true);
    try {
      await deleteBookingMutation.mutateAsync(selectedBooking._id);
      setDeleteModalOpen(false);
      setSelectedBooking(null);
    } catch {
      // Handled in mutation onError
    } finally {
      setDeleting(false);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "booked":
        return (
          <Badge
            variant="outline"
            className="text-[11px] font-medium bg-emerald-50 text-emerald-700 border-emerald-200 gap-1"
          >
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="text-[11px] font-medium bg-amber-50 text-amber-700 border-amber-200 gap-1"
          >
            <Clock3 className="w-3 h-3" /> Pending
          </Badge>
        );
      case "canceled":
        return (
          <Badge
            variant="outline"
            className="text-[11px] font-medium bg-red-50 text-red-700 border-red-200 gap-1"
          >
            <AlertCircle className="w-3 h-3" /> Canceled
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-[11px] font-medium capitalize">
            {status || "Unknown"}
          </Badge>
        );
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* ── Top Header ── */}
      <div className="pb-3 border-b border-gray-200">
        <h1 className="text-xl font-bold font-sans tracking-tight text-gray-900">Bookings</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Real-time reservations schedule, client party tickets, and payment settlement tracking.
        </p>
      </div>

      {/* ── Filter Controls Card ── */}
      <div className="bg-white rounded-2xl p-3 border border-gray-200 shadow-sm">
        <BookingsFilter params={params} setParams={setParams} />
      </div>

      {/* ── Stat Pills ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 bg-white shadow-xs">
          <BookmarkCheck className="w-4 h-4 text-blue-600" />
          <span className="text-xs text-gray-500">Total Bookings:</span>
          <span className="text-xs font-semibold text-gray-900">{noOfDocuments}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 bg-white shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-gray-500">Confirmed (Page):</span>
          <span className="text-xs font-semibold text-gray-900">{bookedCount}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 bg-white shadow-xs">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-xs text-gray-500">Pending (Page):</span>
          <span className="text-xs font-semibold text-gray-900">{pendingCount}</span>
        </div>

        {canceledCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 bg-white shadow-xs">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs text-gray-500">Canceled (Page):</span>
            <span className="text-xs font-semibold text-gray-900">{canceledCount}</span>
          </div>
        )}
      </div>

      {/* ── Table Card ── */}
      <Card className="border border-gray-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[360px] text-gray-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs">Loading booking reservations...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[320px] text-center p-8">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">No bookings found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              No reservation records match the selected date or search filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/60 text-gray-500 font-medium uppercase tracking-wider">
                  <th className="px-4 py-3 w-12 text-center">#</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Venue & Screen</th>
                  <th className="px-4 py-3">Event Date & Slot</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {bookings.map((booking, index) => {
                  const seqNum = (currentPage - 1) * limit + index + 1;
                  const total = booking.totalPrice || 0;
                  const advance = booking.advancePrice || 0;
                  const remaining =
                    booking.remainingAmount !== undefined
                      ? booking.remainingAmount
                      : Math.max(0, total - advance);

                  const locationName = booking.location?.name || "—";
                  const screenName = booking.screen?.name || "—";

                  const formattedDate = booking.date
                    ? new Date(booking.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—";

                  const slotText =
                    booking.slot?.from && booking.slot?.to
                      ? `${convert12Hours(booking.slot.from)} - ${convert12Hours(booking.slot.to)}`
                      : "—";

                  return (
                    <tr
                      key={booking._id}
                      className="hover:bg-gray-50/70 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/admin/bookings/view/${booking._id}`)}
                    >
                      {/* # */}
                      <td className="px-4 py-3 text-center text-gray-400 font-mono text-[11px]">
                        {String(seqNum).padStart(2, "0")}
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-gray-900 block text-xs">
                            {booking.customer?.name || "Guest Customer"}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] text-gray-500 font-mono">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{booking.customer?.number || "—"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Venue & Screen */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-[11px] font-normal">
                            <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                            {locationName}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-700 font-medium">
                            <Tv className="w-3.5 h-3.5 text-blue-600" />
                            <span>{screenName}</span>
                          </div>
                        </div>
                      </td>

                      {/* Event Date & Slot */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-gray-900 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>{formattedDate}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span>{slotText}</span>
                          </div>
                        </div>
                      </td>

                      {/* Payment Breakdown */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5 text-xs">
                          <div className="font-semibold text-gray-900">
                            ₹{total.toLocaleString("en-IN")}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            Adv: <span className="text-emerald-600 font-medium">₹{advance}</span>
                            {" · "}
                            Due:{" "}
                            <span
                              className={
                                remaining > 0
                                  ? "text-amber-600 font-semibold"
                                  : "text-emerald-600 font-medium"
                              }
                            >
                              ₹{remaining}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status & Booking Channel */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {renderStatusBadge(booking.status)}
                          <div>
                            {booking.razorpayOrderId ? (
                              <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Online
                              </span>
                            ) : (
                              <span className="inline-block text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div
                          className="inline-flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => navigate(`/admin/bookings/view/${booking._id}`)}
                            title="View Invoice & Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => openDeleteDialog(booking)}
                            title="Delete booking"
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

        {/* ── Pagination ── */}
        <Pagination
          noOfDocuments={noOfDocuments}
          limit={limit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          params={params}
          setParams={setParams}
        />
      </Card>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2 text-red-600">
              <Trash2 className="w-4 h-4" />
              Delete Booking Reservation
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs text-gray-600">
              Are you sure you want to delete this booking reservation for{" "}
              <span className="font-semibold text-gray-900">
                {selectedBooking?.customer?.name || "this customer"}
              </span>
              ? This action will permanently remove the reservation and release the time slot.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete Booking"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Bookings;
