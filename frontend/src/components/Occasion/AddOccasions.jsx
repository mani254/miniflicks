import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  X,
  IndianRupee,
  Save,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { catalogApi } from "../../api/catalog";
import { getImageUrl } from "../../lib/imageUrl";
import { Button } from "../ui/button.jsx";
import { Switch } from "../ui/switch.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card.jsx";
import { cn } from "../../lib/utils";

/* ─── Drag-and-Drop Image Zone ──────────────────────────────────────── */
function ImageDropZone({ value, onChange }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const preview = value
    ? typeof value === "string"
      ? getImageUrl(value)
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
      <label className="text-sm font-medium text-gray-700">
        Occasion Image <span className="text-red-500">*</span>
      </label>

      <div
        className={cn(
          "relative w-full rounded-lg border-2 border-dashed transition-colors duration-150 cursor-pointer overflow-hidden",
          dragOver
            ? "border-blue-400 bg-blue-50"
            : preview
            ? "border-transparent"
            : "border-gray-300 bg-gray-50 hover:border-gray-400"
        )}
        style={{ minHeight: 140 }}
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
              className="w-full h-40 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all rounded-lg flex items-center justify-center group">
              <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="bg-white text-gray-700 hover:bg-gray-50 shadow text-xs"
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                >
                  <Upload className="w-3.5 h-3.5" /> Change
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="shadow text-xs"
                  onClick={handleClear}
                >
                  <X className="w-3.5 h-3.5" /> Remove
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-8 px-4 text-center">
            <div className="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center">
              <Upload className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-600">
                Drop occasion image here, or{" "}
                <span className="text-blue-600 underline underline-offset-2">browse</span>
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG, WEBP · max 5 MB</p>
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

/* ─── Main Component ────────────────────────────────────────────────── */
function AddOccasions({ update = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { occasionData, refetch } = useOutletContext() || {};

  const [submitting, setSubmitting] = useState(false);
  const [details, setDetails] = useState({
    name: "",
    description: "",
    price: "",
    position: 0,
    image: null,
    status: true,
  });

  useEffect(() => {
    if (update && occasionData?.occasions?.length > 0) {
      const current = occasionData.occasions.find((o) => o._id === id);
      if (!current) return;
      setDetails({
        name: current.name || "",
        description: current.description || "",
        price: current.price ?? "",
        position: current.position ?? 0,
        image: current.image || null,
        status: Boolean(current.status ?? true),
      });
    }
  }, [update, occasionData?.occasions, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!details.name.trim()) {
      toast.error("Occasion name is required");
      return;
    }
    if (!details.price || Number(details.price) < 0) {
      toast.error("Valid price is required");
      return;
    }
    if (!details.image) {
      toast.error("Occasion image is required");
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", details.name.trim());
    formData.append("description", details.description.trim());
    formData.append("price", String(details.price));
    formData.append("position", String(details.position || 0));
    formData.append("status", String(details.status));

    if (details.image instanceof File) {
      formData.append("image", details.image);
    } else if (typeof details.image === "string" && details.image.trim()) {
      formData.append("image", details.image.trim());
    }

    try {
      if (update) {
        await catalogApi.updateOccasion(id, formData);
        toast.success("Occasion updated successfully");
      } else {
        await catalogApi.addOccasion(formData);
        toast.success("Occasion added successfully");
      }
      refetch?.();
      navigate("/admin/occasions");
    } catch (error) {
      toast.error(error.message || "Failed to save occasion");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* ── Top navigation bar ── */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-gray-900"
          onClick={() => navigate("/admin/occasions")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {update ? "Update Occasion" : "Add Occasion"}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {update ? "Modify existing occasion setup" : "Add a celebration theme (e.g. Birthday, Anniversary)"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Occasion Details
            </CardTitle>
            <CardDescription>
              Configure theme name, price added to booking, and banner photo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Occasion Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={details.name}
                onChange={handleChange}
                placeholder="e.g. Birthday Celebration, Anniversary, Romantic Date"
                required
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={details.description}
                onChange={handleChange}
                placeholder="Brief summary of what this celebration package includes..."
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Price */}
              <div className="space-y-1.5">
                <label htmlFor="price" className="text-sm font-medium text-gray-700">
                  Theme Price (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={details.price}
                    onChange={handleChange}
                    placeholder="e.g. 1000"
                    required
                    min="0"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Position */}
              <div className="space-y-1.5">
                <label htmlFor="position" className="text-sm font-medium text-gray-700">
                  Display Order Position
                </label>
                <input
                  type="number"
                  id="position"
                  name="position"
                  value={details.position}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Image dropzone */}
            <ImageDropZone
              value={details.image}
              onChange={(img) => setDetails((prev) => ({ ...prev, image: img }))}
            />

            {/* Status Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-gray-200 bg-gray-50/50">
              <div>
                <p className="text-sm font-medium text-gray-800">Occasion Status</p>
                <p className="text-xs text-gray-500">Available to customers during booking</p>
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
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/occasions")}
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
            {submitting ? "Saving…" : update ? "Update Occasion" : "Save Occasion"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AddOccasions;
