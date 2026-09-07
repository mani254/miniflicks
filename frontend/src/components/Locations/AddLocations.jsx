import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  X,
  MapPin,
  Link2,
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Loader2,
  Building,
} from "lucide-react";
import { toast } from "sonner";

import CityOptions from "../Cities/CityOptions";
import { useAuth } from "../../hooks/useAuth";
import { catalogApi } from "../../api/catalog";
import { getImageUrl } from "../../lib/imageUrl";
import { Button } from "../ui/button.jsx";
import { Switch } from "../ui/switch.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card.jsx";
import { cn } from "../../lib/utils";

/* ─── Drag-and-drop Image Upload Zone ───────────────────────────────── */
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
        Branch Thumbnail Image
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
                Drop image here, or{" "}
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
function AddLocations({ update = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { admin } = useAuth();
  const { locations = [], refetch } = useOutletContext() || {};

  const [details, setDetails] = useState({
    name: "",
    address: "",
    addressLink: "",
    cityId: "",
    admin: {
      name: "",
      email: "",
      number: "",
      password: "",
    },
    image: null,
    status: true,
  });

  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedGifts, setSelectedGifts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Authorization check
  useEffect(() => {
    if (!update && admin && !admin.superAdmin) {
      navigate("/admin/locations", { replace: true });
      toast.error("Log in as Super Admin to add a location");
    }
    if (update && admin && !admin.superAdmin && admin.locationId !== id) {
      navigate("/admin/locations", { replace: true });
      toast.error("You are not authorized to edit this location");
    }
  }, [admin, update, id, navigate]);

  // Load existing location data for edit mode
  useEffect(() => {
    if (update && locations.length > 0) {
      const currentLocation = locations.find((loc) => loc._id === id);
      if (!currentLocation) return;

      const adminObj = currentLocation.admin || {};
      const cityVal = currentLocation.city?._id || currentLocation.city || "";

      setDetails({
        name: currentLocation.name || "",
        address: currentLocation.address || "",
        addressLink: currentLocation.addressLink || "",
        cityId: typeof cityVal === "object" ? cityVal?._id : cityVal,
        admin: {
          name: adminObj.name || "",
          email: adminObj.email || "",
          number: adminObj.phone || adminObj.number || "",
          password: "",
        },
        image: currentLocation.image || null,
        status: Boolean(currentLocation.status),
      });

      setSelectedAddons(currentLocation.addons || []);
      setSelectedGifts(currentLocation.gifts || []);
    }
  }, [update, id, locations]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name.startsWith("admin.")) {
      const adminField = name.split(".")[1];
      setDetails((prev) => ({
        ...prev,
        admin: {
          ...prev.admin,
          [adminField]: value,
        },
      }));
    } else {
      setDetails((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);

  const handleStatusChange = (checked) => {
    setDetails((prev) => ({
      ...prev,
      status: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!details.name.trim()) {
      toast.error("Location name is required");
      return;
    }
    if (!details.address.trim()) {
      toast.error("Address is required");
      return;
    }
    if (!details.cityId) {
      toast.error("City is required");
      return;
    }
    if (!details.admin.name.trim() || !details.admin.email.trim() || !details.admin.number) {
      toast.error("Admin name, email, and phone number are required");
      return;
    }
    if (!update && !details.admin.password) {
      toast.error("Admin password is required when creating a location");
      return;
    }

    setSubmitting(true);

    const locationData = new FormData();
    locationData.append("name", details.name.trim());
    locationData.append("address", details.address.trim());
    locationData.append("addressLink", details.addressLink || "");
    locationData.append("status", details.status);
    locationData.append("cityId", details.cityId);

    if (details.image instanceof File) {
      locationData.append("image", details.image);
    } else if (typeof details.image === "string" && details.image.trim()) {
      locationData.append("image", details.image.trim());
    }

    locationData.append("admin[name]", details.admin.name.trim());
    locationData.append("admin[email]", details.admin.email.trim());
    locationData.append("admin[number]", String(details.admin.number).trim());
    if (details.admin.password) {
      locationData.append("admin[password]", details.admin.password);
    }

    locationData.append("addons", JSON.stringify(selectedAddons));
    locationData.append("gifts", JSON.stringify(selectedGifts));

    try {
      if (update) {
        await catalogApi.updateLocation(id, locationData);
        toast.success("Location updated successfully");
      } else {
        await catalogApi.addLocation(locationData);
        toast.success("Location and branch manager account created successfully");
      }
      refetch?.();
      navigate("/admin/locations");
    } catch (error) {
      toast.error(error.message || "Failed to save location");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* ── Top navigation bar ── */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-gray-900"
          onClick={() => navigate("/admin/locations")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {update ? "Update Location" : "Add Location"}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {update
              ? "Modify branch details and branch manager settings"
              : "Create a new theater branch and create its dedicated location admin"}
          </p>
        </div>
      </div>

      {/* ── Form layout: 2 Columns ── */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Column (2/3): Location Details & Admin Credentials ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Location Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                Location Details
              </CardTitle>
              <CardDescription>
                Basic information and address for this theater branch.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Location Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={details.name}
                    onChange={handleChange}
                    placeholder="e.g. Jubilee Hills, Madhapur, Koramangala"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={details.address}
                    onChange={handleChange}
                    placeholder="Complete street address or landmark"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Address Link */}
              <div className="space-y-1.5">
                <label htmlFor="addressLink" className="text-sm font-medium text-gray-700">
                  Google Maps Link
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="addressLink"
                    name="addressLink"
                    value={details.addressLink}
                    onChange={handleChange}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Branch Manager (Admin) Account */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Branch Manager Account
              </CardTitle>
              <CardDescription>
                Login credentials for the manager assigned to this location. Stored securely in the Admin collection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Admin Name */}
                <div className="space-y-1.5">
                  <label htmlFor="adminName" className="text-sm font-medium text-gray-700">
                    Manager Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="adminName"
                      name="admin.name"
                      value={details.admin.name}
                      onChange={handleChange}
                      placeholder="Manager Full Name"
                      required
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Admin Email */}
                <div className="space-y-1.5">
                  <label htmlFor="adminEmail" className="text-sm font-medium text-gray-700">
                    Manager Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      id="adminEmail"
                      name="admin.email"
                      value={details.admin.email}
                      onChange={handleChange}
                      placeholder="manager@miniflicks.in"
                      required
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Admin Phone */}
                <div className="space-y-1.5">
                  <label htmlFor="adminNumber" className="text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      id="adminNumber"
                      name="admin.number"
                      value={details.admin.number}
                      onChange={handleChange}
                      placeholder="e.g. 9876543210"
                      required
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Admin Password */}
                <div className="space-y-1.5">
                  <label htmlFor="adminPassword" className="text-sm font-medium text-gray-700">
                    Password {update ? <span className="text-xs text-gray-400 font-normal">(Leave blank to keep)</span> : <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      id="adminPassword"
                      name="admin.password"
                      value={details.admin.password}
                      onChange={handleChange}
                      placeholder={update ? "••••••••" : "Enter account password"}
                      required={!update}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right Column (1/3): City, Status, Image, and Actions ── */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Branch Settings</CardTitle>
              <CardDescription>
                Assign city, visibility status, and thumbnail.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* City selector */}
              <CityOptions
                value={details.cityId}
                changeHandler={handleChange}
              />

              {/* Status Switch */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50/50">
                <div>
                  <p className="text-sm font-medium text-gray-800">Status</p>
                  <p className="text-[11px] text-gray-500">
                    Visible to customers for booking
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={details.status}
                    onCheckedChange={handleStatusChange}
                  />
                  <span className={`text-xs font-medium ${details.status ? "text-emerald-600" : "text-gray-400"}`}>
                    {details.status ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Thumbnail Image upload */}
              <ImageDropZone
                value={details.image}
                onChange={(img) => setDetails((prev) => ({ ...prev, image: img }))}
              />

              {/* Submit Button */}
              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {submitting ? "Saving…" : update ? "Update Location" : "Create Location"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

export default AddLocations;
