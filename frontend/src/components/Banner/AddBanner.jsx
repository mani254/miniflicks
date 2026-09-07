import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  X,
  ImageIcon,
  Link2,
  AlignLeft,
  Type,
  Hash,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";

import { catalogApi } from "../../api/catalog.js";
import { getImageUrl } from "../../lib/imageUrl.js";
import { Button } from "../ui/button.jsx";
import { Switch } from "../ui/switch.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card.jsx";
import { cn } from "../../lib/utils.js";

/* ─── Drag-and-drop image zone ──────────────────────────────────────── */
function ImageDropZone({ value, onChange }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const preview = value
    ? typeof value === "string"
      ? getImageUrl(value)   // relative path from DB → full URL for display
      : URL.createObjectURL(value)
    : null;

  function handleFiles(files) {
    if (files?.[0]) onChange(files[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleClear(e) {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-gray-700">
        Banner Image <span className="text-red-500">*</span>
      </p>

      <div
        className={cn(
          "relative w-full rounded-lg border-2 border-dashed transition-colors duration-150 cursor-pointer overflow-hidden",
          dragOver
            ? "border-blue-400 bg-blue-50"
            : preview
            ? "border-transparent"
            : "border-gray-300 bg-gray-50 hover:border-gray-400"
        )}
        style={{ minHeight: 160 }}
        onClick={() => !preview && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-44 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/25 transition-all rounded-lg flex items-center justify-center group">
              <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="bg-white text-gray-700 hover:bg-gray-50 shadow"
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                >
                  <Upload className="w-3.5 h-3.5" /> Change
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="shadow"
                  onClick={handleClear}
                >
                  <X className="w-3.5 h-3.5" /> Remove
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center">
            <div className="w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center">
              <Upload className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Drop image here, or{" "}
                <span className="text-blue-600 underline underline-offset-2">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP · max 5 MB</p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

/* ─── Field wrapper ─────────────────────────────────────────────────── */
const inputCls =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50";

function Field({ icon: Icon, label, required, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
function AddBanner({ update = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { banners = [], refetch } = useOutletContext() || {};
  const [submitting, setSubmitting] = useState(false);

  const [details, setDetails] = useState({
    title: "",
    description: "",
    link: "",
    image: null,
    status: true,
    position: 0,
  });

  /* pre-fill on edit */
  useEffect(() => {
    if (update && banners.length > 0) {
      const current = banners.find((b) => b._id === id);
      if (!current) return;
      setDetails({
        title: current.title || "",
        description: current.description || "",
        link: current.link || "",
        image: current.image || null,
        status: current.status ?? true,
        position: current.position ?? 0,
      });
    }
  }, [banners, update, id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!details.image) {
      toast.error("Please upload a banner image.");
      return;
    }

    setSubmitting(true);
    const fd = new FormData();
    fd.append("title", details.title);
    fd.append("description", details.description);
    fd.append("position", details.position);
    fd.append("link", details.link);
    fd.append("status", details.status);
    if (details.image instanceof File) fd.append("image", details.image);
    else if (typeof details.image === "string") fd.append("image", details.image);

    const toastId = toast.loading(update ? "Updating…" : "Saving…");
    try {
      if (update) {
        await catalogApi.updateBanner(id, fd);
        toast.success("Banner updated", { id: toastId });
      } else {
        await catalogApi.addBanner(fd);
        toast.success("Banner added", { id: toastId });
      }
      refetch?.();
      navigate("/admin/banners");
    } catch (error) {
      toast.error(error.message || "Failed to save banner", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-5xl space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate("/admin/banners")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {update ? "Edit Banner" : "Add Banner"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {update ? "Update banner details." : "Create a new promotional banner."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Left: info ── */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Banner Details</CardTitle>
              <CardDescription>Fill in the information for this banner.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field icon={Type} label="Title" required>
                <input
                  className={inputCls}
                  type="text"
                  name="title"
                  placeholder="e.g. Summer Sale"
                  value={details.title}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field icon={AlignLeft} label="Description" required>
                <textarea
                  className={cn(inputCls, "resize-none min-h-[80px]")}
                  name="description"
                  placeholder="Short description…"
                  value={details.description}
                  onChange={handleChange}
                  required
                  rows={3}
                />
              </Field>

              <Field icon={Link2} label="Link" required hint="Use a relative path, e.g. /locations or /bookings">
                <input
                  className={inputCls}
                  type="text"
                  name="link"
                  placeholder="/locations"
                  value={details.link}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field
                icon={Hash}
                label="Position"
                required
                hint="Lower number = higher priority. 0 is the topmost."
              >
                <input
                  className={inputCls}
                  type="number"
                  name="position"
                  placeholder="0"
                  value={details.position}
                  onChange={handleChange}
                  required
                  min={0}
                />
              </Field>
            </CardContent>
          </Card>
        </div>

        {/* ── Right: image + status ── */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Image & Visibility</CardTitle>
              <CardDescription>Upload an image and set the banner status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageDropZone
                value={details.image}
                onChange={(file) => setDetails((prev) => ({ ...prev, image: file }))}
              />

              {/* Status toggle */}
              <div className="flex items-center justify-between py-3 px-3 rounded-md border border-gray-200 bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-700">Active</p>
                  <p className="text-xs text-gray-400">
                    {details.status ? "Visible to customers" : "Hidden from customers"}
                  </p>
                </div>
                <Switch
                  checked={details.status}
                  onCheckedChange={(checked) =>
                    setDetails((prev) => ({ ...prev, status: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {submitting
                ? update ? "Updating…" : "Saving…"
                : update ? "Update Banner" : "Add Banner"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate("/admin/banners")}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddBanner;
