import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  Calendar,
  Clock,
  MapPin,
  Tv,
  User,
  Phone,
  Mail,
  Users,
  Sparkles,
  Cake as CakeIcon,
  Gift as GiftIcon,
  PackageCheck,
  Tag,
  CheckCircle2,
  AlertCircle,
  Clock3,
  ExternalLink,
} from "lucide-react";
import { convert12Hours } from "../../utils";
import { Button } from "../ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";

const DetailedBooking = ({ bookingData }) => {
  const navigate = useNavigate();

  if (!bookingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 gap-3">
        <AlertCircle className="w-10 h-10 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-800">Booking details unavailable</h2>
        <p className="text-xs text-gray-400">The requested reservation record could not be found.</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/admin/bookings")}>
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Return to Bookings
        </Button>
      </div>
    );
  }

  // Pricing calculations
  const packagePrice = bookingData.package?.price || 0;
  const occasionPrice = bookingData.occasion?.price || 0;

  const getExactLedPrice = () => {
    const ledData = bookingData.addons?.find((item) => item.name === "LED Name");
    if (!ledData) return 0;
    if (bookingData.ledName && bookingData.ledName.length > 8) {
      return ledData.price + (bookingData.ledName.length - 8) * 30;
    }
    return ledData.price;
  };

  const extraPeopleCount =
    bookingData.numberOfPeople > (bookingData.screen?.minPeople || 2)
      ? bookingData.numberOfPeople - (bookingData.screen?.minPeople || 2)
      : 0;

  const extraPeoplePrice =
    extraPeopleCount * (bookingData.screen?.extraPersonPrice || 0);

  const total = bookingData.totalPrice || 0;
  const advance = bookingData.advancePrice || 0;
  const remaining =
    bookingData.remainingAmount !== undefined
      ? bookingData.remainingAmount
      : Math.max(0, total - advance);

  const handlePrint = () => {
    window.print();
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "booked":
        return (
          <Badge
            variant="outline"
            className="text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-300 gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="text-xs font-semibold bg-amber-50 text-amber-700 border-amber-300 gap-1"
          >
            <Clock3 className="w-3.5 h-3.5" /> Pending Payment
          </Badge>
        );
      case "canceled":
        return (
          <Badge
            variant="outline"
            className="text-xs font-semibold bg-red-50 text-red-700 border-red-300 gap-1"
          >
            <AlertCircle className="w-3.5 h-3.5" /> Canceled
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs font-semibold capitalize">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* ── Top Bar (Hidden on print) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4 print:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/bookings")}
            className="gap-1 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Bookings
          </Button>
          <span className="text-xs text-gray-400">/</span>
          <span className="text-xs font-mono text-gray-600">ID: {bookingData._id}</span>
        </div>

        <div className="flex items-center gap-2">
          {renderStatusBadge(bookingData.status)}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 text-xs text-gray-700 hover:text-gray-900"
          >
            <Printer className="w-3.5 h-3.5" /> Print Receipt
          </Button>
        </div>
      </div>

      {/* ── Invoice Paper Card ── */}
      <Card className="border border-gray-200 bg-white shadow-sm overflow-hidden print:border-0 print:shadow-none">
        {/* Invoice Header */}
        <div className="p-6 bg-gray-50/70 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-gray-900">
                  MINIFLICKS
                </span>
                <Badge variant="secondary" className="text-[10px] font-mono tracking-wider uppercase">
                  Private Theater Voucher
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Booking Reference:{" "}
                <span className="font-mono font-semibold text-gray-800">
                  #{bookingData._id}
                </span>
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="text-xs text-gray-500">
                Booked On:{" "}
                <span className="font-semibold text-gray-800">
                  {bookingData.createdAt
                    ? new Date(bookingData.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
              <div>{renderStatusBadge(bookingData.status)}</div>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* ── Two Column Meta Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg border border-gray-100 bg-gray-50/40">
            {/* Customer Information */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Customer Contact
              </h4>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-gray-900 text-sm">
                  {bookingData.customer?.name || "Guest Customer"}
                </p>
                <p className="text-gray-600 flex items-center gap-1.5 font-mono">
                  <Phone className="w-3 h-3 text-gray-400" />
                  {bookingData.customer?.number || "—"}
                </p>
                <p className="text-gray-600 flex items-center gap-1.5 font-mono">
                  <Mail className="w-3 h-3 text-gray-400" />
                  {bookingData.customer?.email || "—"}
                </p>
              </div>
            </div>

            {/* Venue & Schedule */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-blue-600" />
                Auditorium & Schedule
              </h4>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-gray-900 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                  {bookingData.location?.name || "Branch Venue"}
                </p>
                <p className="text-gray-600 pl-4 font-medium">
                  Screen: {bookingData.screen?.name || "Auditorium"}
                </p>
                <p className="text-gray-600 pl-4 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  {bookingData.date
                    ? new Date(bookingData.date).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                  {" · "}
                  <Clock className="w-3 h-3 text-gray-400" />
                  {bookingData.slot?.from && bookingData.slot?.to
                    ? `${convert12Hours(bookingData.slot.from)} - ${convert12Hours(bookingData.slot.to)}`
                    : "—"}
                </p>
                <p className="text-gray-600 pl-4 flex items-center gap-1">
                  <Users className="w-3 h-3 text-gray-400" />
                  Total Guests:{" "}
                  <span className="font-semibold text-gray-800">
                    {bookingData.numberOfPeople || 2} People
                  </span>
                  {extraPeopleCount > 0 && (
                    <span className="text-gray-400 text-[11px]">
                      {" "}
                      ({bookingData.screen?.minPeople || 2} base + {extraPeopleCount} extra)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* ── Experience Personalizations (If any) ── */}
          {(bookingData.nameOnCake ||
            bookingData.ledName ||
            bookingData.ledNumber ||
            bookingData.occasion?.celebrantName ||
            bookingData.note) && (
            <div className="p-4 rounded-lg border border-blue-100 bg-blue-50/40 space-y-2.5">
              <h4 className="text-xs font-semibold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Celebration Personalizations
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {bookingData.occasion?.celebrantName && (
                  <div>
                    <span className="text-gray-500 block text-[11px]">Celebrant:</span>
                    <span className="font-semibold text-gray-800">
                      {bookingData.occasion.celebrantName}
                    </span>
                  </div>
                )}
                {bookingData.nameOnCake && (
                  <div>
                    <span className="text-gray-500 block text-[11px]">Name on Cake:</span>
                    <span className="font-semibold text-gray-800">
                      &quot;{bookingData.nameOnCake}&quot;
                    </span>
                  </div>
                )}
                {bookingData.ledName && (
                  <div>
                    <span className="text-gray-500 block text-[11px]">LED Name Sign:</span>
                    <span className="font-semibold text-gray-800 font-mono">
                      {bookingData.ledName}
                    </span>
                  </div>
                )}
                {bookingData.ledNumber && (
                  <div>
                    <span className="text-gray-500 block text-[11px]">LED Number Sign:</span>
                    <span className="font-semibold text-gray-800 font-mono">
                      {bookingData.ledNumber}
                    </span>
                  </div>
                )}
                {bookingData.note && (
                  <div className="sm:col-span-2">
                    <span className="text-gray-500 block text-[11px]">Special Instructions:</span>
                    <span className="text-gray-700 italic">{bookingData.note}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Itemized Line Items Table ── */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
              Itemized Experience Breakdown
            </h4>

            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 font-medium uppercase tracking-wider">
                    <th className="px-4 py-2.5">Item Description</th>
                    <th className="px-4 py-2.5 text-center w-20">Qty</th>
                    <th className="px-4 py-2.5 text-right w-24">Unit Price</th>
                    <th className="px-4 py-2.5 text-right w-28">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {/* Package */}
                  {bookingData.package && (
                    <tr>
                      <td className="px-4 py-2.5">
                        <span className="font-semibold text-gray-900 block">
                          {bookingData.package.name}
                        </span>
                        {Array.isArray(bookingData.package.addons) && (
                          <span className="text-[11px] text-gray-400 block">
                            Includes: {bookingData.package.addons.join(", ")}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">1</td>
                      <td className="px-4 py-2.5 text-right font-mono">₹{packagePrice}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold text-gray-900">
                        ₹{packagePrice}
                      </td>
                    </tr>
                  )}

                  {/* Extra People Surcharge */}
                  {extraPeopleCount > 0 && (
                    <tr>
                      <td className="px-4 py-2.5">
                        <span className="font-medium text-gray-900">Extra Guests Surcharge</span>
                        <span className="text-[11px] text-gray-400 block">
                          {extraPeopleCount} guests above {bookingData.screen?.minPeople || 2} included
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">{extraPeopleCount}</td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        ₹{bookingData.screen?.extraPersonPrice || 0}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold text-gray-900">
                        ₹{extraPeoplePrice}
                      </td>
                    </tr>
                  )}

                  {/* Occasion */}
                  {bookingData.occasion?.name && (
                    <tr>
                      <td className="px-4 py-2.5">
                        <span className="font-medium text-gray-900">
                          Occasion: {bookingData.occasion.name}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">1</td>
                      <td className="px-4 py-2.5 text-right font-mono">₹{occasionPrice}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold text-gray-900">
                        ₹{occasionPrice}
                      </td>
                    </tr>
                  )}

                  {/* Cakes */}
                  {Array.isArray(bookingData.cakes) &&
                    bookingData.cakes.map((cake, idx) => (
                      <tr key={`cake-${idx}`}>
                        <td className="px-4 py-2.5">
                          <span className="font-medium text-gray-900">
                            Cake: {cake.name}
                          </span>
                          {cake.free && (
                            <span className="text-[11px] text-emerald-600 block">
                              Package Included
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center">1</td>
                        <td className="px-4 py-2.5 text-right font-mono">
                          ₹{cake.price || 0}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-gray-900">
                          ₹{cake.price || 0}
                        </td>
                      </tr>
                    ))}

                  {/* Addons */}
                  {Array.isArray(bookingData.addons) &&
                    bookingData.addons.map((addon, idx) => {
                      const isLed = addon.name === "LED Name";
                      const effectivePrice = isLed ? getExactLedPrice() : addon.price;
                      return (
                        <tr key={`addon-${idx}`}>
                          <td className="px-4 py-2.5">
                            <span className="font-medium text-gray-900">{addon.name}</span>
                            {isLed && bookingData.ledName && bookingData.ledName.length > 8 && (
                              <span className="text-[11px] text-gray-400 block">
                                Surcharge: {bookingData.ledName.length - 8} chars @ ₹30/char
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-center">{addon.count || 1}</td>
                          <td className="px-4 py-2.5 text-right font-mono">₹{effectivePrice}</td>
                          <td className="px-4 py-2.5 text-right font-mono font-semibold text-gray-900">
                            ₹{(addon.count || 1) * effectivePrice}
                          </td>
                        </tr>
                      );
                    })}

                  {/* Gifts */}
                  {Array.isArray(bookingData.gifts) &&
                    bookingData.gifts.map((gift, idx) => (
                      <tr key={`gift-${idx}`}>
                        <td className="px-4 py-2.5 font-medium text-gray-900">
                          Gift: {gift.name}
                        </td>
                        <td className="px-4 py-2.5 text-center">{gift.count || 1}</td>
                        <td className="px-4 py-2.5 text-right font-mono">₹{gift.price}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-gray-900">
                          ₹{(gift.count || 1) * gift.price}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Financial Breakdown & Payment Status ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Payment Summary */}
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 space-y-2">
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Payment Breakdown
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Advance Payment Paid:</span>
                  <span className="font-mono font-semibold text-emerald-600">
                    ₹{advance.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Remaining Due at Venue:</span>
                  <span
                    className={`font-mono font-semibold ${
                      remaining > 0 ? "text-amber-600" : "text-emerald-600"
                    }`}
                  >
                    ₹{remaining.toLocaleString("en-IN")}
                  </span>
                </div>
                {bookingData.couponCode && (
                  <div className="flex justify-between text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                    <span>Coupon ({bookingData.couponCode}):</span>
                    <span className="font-mono font-semibold">
                      -₹{Math.abs(bookingData.couponPrice || 0)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Grand Total Highlight */}
            <div className="p-4 rounded-lg border-2 border-blue-600/20 bg-blue-50/40 flex flex-col justify-between">
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grand Total Price
                </span>
                <div className="text-2xl font-extrabold text-gray-900 font-mono mt-1">
                  ₹{total.toLocaleString("en-IN")}
                </div>
              </div>

              <div className="pt-3 border-t border-blue-200/60 flex items-center justify-between text-xs">
                <span className="text-gray-600">Settlement Status:</span>
                {remaining === 0 ? (
                  <Badge className="bg-emerald-600 text-white font-medium text-[11px]">
                    Fully Settled
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 text-[11px]">
                    ₹{remaining} Due Upon Arrival
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailedBooking;
