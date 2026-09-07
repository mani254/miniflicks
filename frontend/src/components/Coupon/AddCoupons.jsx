import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import {
  ArrowLeft,
  Tag,
  Percent,
  IndianRupee,
  Calendar,
  Sparkles,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { catalogApi } from "../../api/catalog";
import { Button } from "../ui/button.jsx";
import { Switch } from "../ui/switch.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card.jsx";

function AddCoupons({ update = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { coupons = [], refetch } = useOutletContext() || {};

  const [submitting, setSubmitting] = useState(false);
  const [details, setDetails] = useState({
    code: "",
    discount: "",
    type: "percentage",
    expireDate: "",
    status: true,
    scrollCoupon: false,
    scrollingText: "",
  });

  useEffect(() => {
    if (update && coupons.length > 0) {
      const current = coupons.find((c) => c._id === id);
      if (!current) return;

      const formattedExpireDate = current.expireDate
        ? new Date(current.expireDate).toISOString().split("T")[0]
        : "";

      setDetails({
        code: current.code || "",
        discount: current.discount ?? "",
        type: current.type || "percentage",
        expireDate: formattedExpireDate,
        status: Boolean(current.status),
        scrollCoupon: Boolean(current.scrollCoupon),
        scrollingText: current.scrollingText || "",
      });
    }
  }, [coupons, update, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;
    if (name === "code") {
      updatedValue = value.toUpperCase().trim();
    }
    setDetails((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!details.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }
    if (!details.discount || Number(details.discount) <= 0) {
      toast.error("Valid discount amount is required");
      return;
    }
    if (!details.expireDate) {
      toast.error("Expiry date is required");
      return;
    }

    setSubmitting(true);

    const payload = {
      ...details,
      discount: Number(details.discount),
    };

    try {
      if (update) {
        await catalogApi.updateCoupon(id, payload);
        toast.success("Coupon updated successfully");
      } else {
        await catalogApi.addCoupon(payload);
        toast.success("Coupon added successfully");
      }
      refetch?.();
      navigate("/admin/coupons");
    } catch (error) {
      toast.error(error.message || "Failed to save coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* ── Top navigation bar ── */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-gray-900"
          onClick={() => navigate("/admin/coupons")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {update ? "Update Coupon" : "Add Coupon"}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {update ? "Modify existing discount coupon" : "Create a new discount code for theater bookings"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Card 1: Core Details ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Discount Settings</CardTitle>
            <CardDescription>
              Specify coupon code, discount rate, and validity duration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Code */}
            <div className="space-y-1.5">
              <label htmlFor="code" className="text-sm font-medium text-gray-700">
                Coupon Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Tag className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={details.code}
                  onChange={handleChange}
                  placeholder="e.g. WELCOME50, FESTIVE100"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono uppercase tracking-wider rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Type */}
              <div className="space-y-1.5">
                <label htmlFor="type" className="text-sm font-medium text-gray-700">
                  Discount Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={details.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              {/* Discount Amount */}
              <div className="space-y-1.5">
                <label htmlFor="discount" className="text-sm font-medium text-gray-700">
                  Discount Value ({details.type === "percentage" ? "%" : "₹"}) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    {details.type === "percentage" ? (
                      <Percent className="w-4 h-4" />
                    ) : (
                      <IndianRupee className="w-4 h-4" />
                    )}
                  </div>
                  <input
                    type="number"
                    id="discount"
                    name="discount"
                    value={details.discount}
                    onChange={handleChange}
                    placeholder={details.type === "percentage" ? "e.g. 20" : "e.g. 200"}
                    required
                    min="1"
                    max={details.type === "percentage" ? "100" : undefined}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-1.5">
              <label htmlFor="expireDate" className="text-sm font-medium text-gray-700">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  id="expireDate"
                  name="expireDate"
                  value={details.expireDate}
                  onChange={handleChange}
                  min={today}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Card 2: Scrolling Banner Announcement ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Website Banner Announcement
            </CardTitle>
            <CardDescription>
              Optionally display this promotion as a marquee announcement at the top of the customer website.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50/50">
              <div>
                <p className="text-sm font-medium text-gray-800">Show in Scrolling Header</p>
                <p className="text-xs text-gray-500">
                  Broadcast this discount code to all visiting customers
                </p>
              </div>
              <Switch
                checked={details.scrollCoupon}
                onCheckedChange={(checked) => setDetails((prev) => ({ ...prev, scrollCoupon: checked }))}
              />
            </div>

            {details.scrollCoupon && (
              <div className="space-y-1.5 pt-1">
                <label htmlFor="scrollingText" className="text-sm font-medium text-gray-700">
                  Announcement Text
                </label>
                <input
                  type="text"
                  id="scrollingText"
                  name="scrollingText"
                  value={details.scrollingText}
                  onChange={handleChange}
                  placeholder="e.g. 🎉 Special Offer! Use code WELCOME50 to get 50% OFF your booking!"
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            )}

            {/* Status */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50/50">
              <div>
                <p className="text-sm font-medium text-gray-800">Coupon Active Status</p>
                <p className="text-xs text-gray-500">Inactive coupons cannot be redeemed</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={details.status}
                  onCheckedChange={(checked) => setDetails((prev) => ({ ...prev, status: checked }))}
                />
                <span className={`text-xs font-medium ${details.status ? "text-emerald-600" : "text-gray-400"}`}>
                  {details.status ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Submit actions ── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/coupons")}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {submitting ? "Saving…" : update ? "Update Coupon" : "Save Coupon"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AddCoupons;
