import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Clock,
  FileText,
  ImageIcon,
  IndianRupee,
  Loader2,
  Plus,
  Sliders,
  Sparkles,
  Trash2,
  Tv,
  UploadCloud,
  UserCheck,
  Users,
  X
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { toast } from "sonner";
import { catalogApi } from "../../api/catalog";
import { useAuth } from "../../hooks/useAuth";
import { useLocations } from "../../hooks/useCatalog";
import { getImageUrl } from "../../lib/imageUrl";
import { Badge } from "../ui/badge.jsx";
import { Button } from "../ui/button.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card.jsx";
import { Switch } from "../ui/switch.jsx";
import PackageForm from "./Packages";

/* ─── Multi-Image Gallery Dropzone ────────────────────────────────────────── */
function MultiImageGallery({ images = [], onChange, maxImages = 6 }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image file.`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds the 5 MB limit.`);
        return false;
      }
      return true;
    });

    if (fileList.length === 0) return;

    if (images.length + fileList.length > maxImages) {
      toast.error(`You can upload a maximum of ${maxImages} images.`);
      const remainingSlots = Math.max(0, maxImages - images.length);
      if (remainingSlots > 0) {
        onChange([...images, ...fileList.slice(0, remainingSlots)]);
      }
      return;
    }

    onChange([...images, ...fileList]);
  };

  const removeImage = (indexToRemove) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50/50"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/60"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-700">
              Drop screen photos here, or{" "}
              <span className="text-blue-600 underline underline-offset-2">
                browse files
              </span>
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              JPG, PNG, WEBP · Up to {maxImages} images (max 5 MB each)
            </p>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Image Previews Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          {images.map((item, idx) => {
            const isFile = item instanceof File;
            const previewUrl = isFile
              ? URL.createObjectURL(item)
              : getImageUrl(item);
            const label = isFile ? item.name : `Image ${idx + 1}`;

            return (
              <div
                key={idx}
                className="relative group rounded-lg border border-gray-200 bg-gray-50 overflow-hidden aspect-video flex items-center justify-center shadow-sm"
              >
                <img
                  src={previewUrl}
                  alt={label}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement
                      ?.querySelector(".fallback-icon")
                      ?.classList.remove("hidden");
                  }}
                />
                <div className="fallback-icon hidden text-gray-400">
                  <ImageIcon className="w-6 h-6" />
                </div>

                {/* Overlay with Delete */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md shadow transition-colors"
                    title="Remove image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Badge for Index */}
                <div className="absolute top-1.5 left-1.5">
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 bg-white/90 text-gray-700 shadow-sm backdrop-blur-xs"
                  >
                    {idx === 0 ? "Cover" : `#${idx + 1}`}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Main AddScreens Component ────────────────────────────────────────── */
function AddScreens({ update = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { admin } = useAuth();
  const isSuperAdmin = admin?.role === "superAdmin";

  const { screens = [], refetch } = useOutletContext() || {};
  const { data: locations = [] } = useLocations();

  const [loadingScreen, setLoadingScreen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [details, setDetails] = useState({
    name: "",
    capacity: "",
    minPeople: "",
    extraPersonPrice: "",
    description: "",
    location: "",
    images: [],
    status: true,
  });

  const [specifications, setSpecifications] = useState([]);
  const [newSpecInput, setNewSpecInput] = useState("");

  const [slots, setSlots] = useState([
    { from: "10:00", to: "13:00" },
    { from: "14:00", to: "17:00" },
    { from: "18:00", to: "21:00" },
  ]);

  const [packages, setPackages] = useState([
    {
      name: "Standard Package",
      price: 1499,
      customPrice: [],
      addons: ["4k Dolby Theater", "Decoration", "Cake"],
    },
  ]);

  // Set default location for location admin
  useEffect(() => {
    if (!isSuperAdmin && admin?.locationId && !details.location) {
      setDetails((prev) => ({ ...prev, location: admin.locationId }));
    }
  }, [isSuperAdmin, admin, details.location]);

  // If superadmin and no location selected yet, pick first location
  useEffect(() => {
    if (isSuperAdmin && locations.length > 0 && !details.location && !update) {
      setDetails((prev) => ({ ...prev, location: locations[0]._id }));
    }
  }, [isSuperAdmin, locations, details.location, update]);

  // Load screen data in update mode
  useEffect(() => {
    if (!update || !id) return;

    const populateScreenData = (screen) => {
      const locId =
        typeof screen.location === "object"
          ? screen.location?._id
          : screen.location;

      // Ownership enforcement for branch admins
      if (
        !isSuperAdmin &&
        admin?.locationId &&
        locId?.toString() !== admin.locationId.toString()
      ) {
        toast.error(
          "Unauthorized: You can only edit screens belonging to your branch.",
        );
        navigate("/admin/screens");
        return;
      }

      setDetails({
        name: screen.name || "",
        capacity: screen.capacity ?? "",
        minPeople: screen.minPeople ?? "",
        extraPersonPrice: screen.extraPersonPrice ?? 0,
        description: screen.description || "",
        location: locId || "",
        images: screen.images || [],
        status: screen.status !== undefined ? screen.status : true,
      });

      setSpecifications(
        Array.isArray(screen.specifications) && screen.specifications.length > 0
          ? screen.specifications
          : [],
      );

      setSlots(
        Array.isArray(screen.slots) && screen.slots.length > 0
          ? screen.slots
          : [{ from: "", to: "" }],
      );

      setPackages(
        Array.isArray(screen.packages) && screen.packages.length > 0
          ? screen.packages
          : [
              {
                name: "Standard Package",
                price: 1499,
                customPrice: [],
                addons: ["4k Dolby Theater", "Decoration", "Cake"],
              },
            ],
      );
    };

    const cachedScreen = screens.find((s) => s._id === id);
    if (cachedScreen) {
      populateScreenData(cachedScreen);
    } else {
      setLoadingScreen(true);
      catalogApi
        .getScreen(id)
        .then((fetched) => {
          if (fetched) {
            populateScreenData(fetched);
          } else {
            toast.error("Screen not found");
            navigate("/admin/screens");
          }
        })
        .catch((err) => {
          toast.error(err.message || "Failed to load screen details");
          navigate("/admin/screens");
        })
        .finally(() => {
          setLoadingScreen(false);
        });
    }
  }, [update, id, screens, isSuperAdmin, admin, navigate]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setDetails((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  // Specifications management
  const handleAddSpecification = () => {
    if (!newSpecInput.trim()) return;
    if (specifications.includes(newSpecInput.trim())) {
      toast.error("This specification already exists.");
      return;
    }
    setSpecifications((prev) => [...prev, newSpecInput.trim()]);
    setNewSpecInput("");
  };

  const handleDeleteSpecification = (index) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  // Time slots management
  const handleSlotChange = (index, field, value) => {
    setSlots((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleAddSlot = () => {
    setSlots((prev) => [...prev, { from: "", to: "" }]);
  };

  const handleDeleteSlot = (index) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!details.name.trim()) {
      toast.error("Please enter a screen name.");
      return;
    }
    if (!details.location) {
      toast.error("Please select a location branch.");
      return;
    }
    if (!details.capacity || Number(details.capacity) < 1) {
      toast.error("Please provide a valid maximum capacity (at least 1).");
      return;
    }
    if (!details.minPeople || Number(details.minPeople) < 1) {
      toast.error("Please provide a valid minimum guest count (at least 1).");
      return;
    }
    if (Number(details.minPeople) > Number(details.capacity)) {
      toast.error("Minimum guest count cannot exceed maximum capacity.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", details.name.trim());
      formData.append("capacity", String(Number(details.capacity)));
      formData.append("minPeople", String(Number(details.minPeople)));
      formData.append(
        "extraPersonPrice",
        String(Number(details.extraPersonPrice) || 0),
      );
      formData.append("description", details.description.trim());
      formData.append("location", details.location);
      formData.append("status", String(details.status));

      // Append clean JSON fields
      const cleanSpecs = specifications.filter((s) => s.trim().length > 0);
      formData.append("specifications", JSON.stringify(cleanSpecs));

      const cleanSlots = slots.filter((s) => s.from && s.to);
      formData.append("slots", JSON.stringify(cleanSlots));

      formData.append("packages", JSON.stringify(packages));

      // Append images
      if (Array.isArray(details.images)) {
        details.images.forEach((item) => {
          if (item instanceof File) {
            formData.append("images", item);
          } else if (typeof item === "string" && item.trim()) {
            // Strip domain if present to keep relative path clean
            const cleanPath = item.replace(/^https?:\/\/[^/]+/, "");
            formData.append("images", cleanPath);
          }
        });
      }

      if (update) {
        await catalogApi.updateScreen(id, formData);
        toast.success("Screen updated successfully!");
      } else {
        await catalogApi.addScreen(formData);
        toast.success("Screen created successfully!");
      }

      if (refetch) refetch();
      navigate("/admin/screens");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save screen.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingScreen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm">Loading screen configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/admin/screens"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Screens
            </Link>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            {update ? "Update Screen" : "Add New Screen"}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure theater auditorium specifications, time slots, guest
            capacities, and pricing tiers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/screens")}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="screen-form"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {update ? "Updating..." : "Saving..."}
              </>
            ) : update ? (
              "Update Screen"
            ) : (
              "Create Screen"
            )}
          </Button>
        </div>
      </div>

      <form id="screen-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Left Column (2 Cols) ────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card 1: Screen Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Tv className="w-4 h-4 text-blue-600" />
                  Screen Details & Capacity
                </CardTitle>
                <CardDescription>
                  Define screen identity, assigned location branch, and guest
                  headcounts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Screen Name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="name"
                    className="text-xs font-medium text-gray-700"
                  >
                    Screen Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Tv className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={details.name}
                      onChange={handleChange}
                      placeholder="e.g. Royal VIP Screen 1, Silver Suite"
                      required
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Branch Location Selection */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="location"
                    className="text-xs font-medium text-gray-700"
                  >
                    Branch Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    {isSuperAdmin ? (
                      <select
                        id="location"
                        name="location"
                        value={details.location}
                        onChange={handleChange}
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all cursor-pointer"
                      >
                        <option value="" disabled>
                          Select branch location...
                        </option>
                        {locations.map((loc) => (
                          <option key={loc._id} value={loc._id}>
                            {loc.name}{" "}
                            {loc.cityId?.name ? `(${loc.cityId.name})` : ""}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        disabled
                        value={
                          locations.find((l) => l._id === admin?.locationId)
                            ?.name || "Assigned Branch"
                        }
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    )}
                  </div>
                  {!isSuperAdmin && (
                    <p className="text-[11px] text-gray-400">
                      Screens are locked to your assigned branch location.
                    </p>
                  )}
                </div>

                {/* Capacities & Extra Person Surcharge */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  {/* Maximum Capacity */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="capacity"
                      className="text-xs font-medium text-gray-700"
                    >
                      Max Capacity <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <input
                        type="number"
                        id="capacity"
                        name="capacity"
                        min="1"
                        value={details.capacity}
                        onChange={handleChange}
                        placeholder="e.g. 10"
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Maximum guest limit
                    </p>
                  </div>

                  {/* Minimum People Included */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="minPeople"
                      className="text-xs font-medium text-gray-700"
                    >
                      Base People <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <input
                        type="number"
                        id="minPeople"
                        name="minPeople"
                        min="1"
                        value={details.minPeople}
                        onChange={handleChange}
                        placeholder="e.g. 2"
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Included in package
                    </p>
                  </div>

                  {/* Extra Person Price */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="extraPersonPrice"
                      className="text-xs font-medium text-gray-700"
                    >
                      Extra Person (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <IndianRupee className="w-4 h-4" />
                      </div>
                      <input
                        type="number"
                        id="extraPersonPrice"
                        name="extraPersonPrice"
                        min="0"
                        value={details.extraPersonPrice}
                        onChange={handleChange}
                        placeholder="e.g. 250"
                        required
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Per additional guest
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5 pt-1">
                  <label
                    htmlFor="description"
                    className="text-xs font-medium text-gray-700"
                  >
                    Screen Description
                  </label>
                  <div className="relative">
                    <div className="absolute top-2.5 left-3 pointer-events-none text-gray-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={details.description}
                      onChange={handleChange}
                      placeholder="Highlights, seating layout, acoustic features, and ambiance..."
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Technical Specifications */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Technical Specifications & Highlights
                </CardTitle>
                <CardDescription>
                  Display bulleted feature highlights on the booking page (e.g.,
                  4K Laser Projection, Dolby Atmos).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Input row */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSpecInput}
                    onChange={(e) => setNewSpecInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSpecification();
                      }
                    }}
                    placeholder="Add specification (e.g. 150-inch 4K Laser Screen, Recliner Sofas)"
                    className="flex-1 px-3 py-1.5 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddSpecification}
                    className="gap-1 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </Button>
                </div>

                {/* Tags List */}
                {specifications.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">
                    No specifications added yet. Type a feature above and press
                    Enter.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {specifications.map((spec, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
                      >
                        {spec}
                        <button
                          type="button"
                          onClick={() => handleDeleteSpecification(idx)}
                          className="text-gray-400 hover:text-red-600 rounded-full focus:outline-none"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card 3: Booking Time Slots */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Available Time Slots
                  </CardTitle>
                  <CardDescription>
                    Operating slots for booking throughout the day.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddSlot}
                  className="gap-1 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Slot
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {slots.length === 0 ? (
                  <div className="border border-dashed border-gray-200 rounded-lg p-6 text-center text-xs text-gray-500">
                    No time slots configured. Click &quot;Add Slot&quot; to
                    define booking windows.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {slots.map((slot, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 bg-gray-50/50"
                      >
                        <div className="flex-1 space-y-1">
                          <label className="text-[11px] font-medium text-gray-500">
                            From
                          </label>
                          <input
                            type="time"
                            value={slot.from}
                            onChange={(e) =>
                              handleSlotChange(idx, "from", e.target.value)
                            }
                            required
                            className="w-full px-2 py-1 text-xs rounded border border-gray-200 bg-white"
                          />
                        </div>
                        <span className="text-gray-400 text-xs mt-4">to</span>
                        <div className="flex-1 space-y-1">
                          <label className="text-[11px] font-medium text-gray-500">
                            To
                          </label>
                          <input
                            type="time"
                            value={slot.to}
                            onChange={(e) =>
                              handleSlotChange(idx, "to", e.target.value)
                            }
                            required
                            className="w-full px-2 py-1 text-xs rounded border border-gray-200 bg-white"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSlot(idx)}
                          className="h-8 w-8 text-gray-400 hover:text-red-600 mt-4"
                          title="Delete slot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card 4: Packages & Custom Date Rates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  Screen Packages & Tiered Pricing
                </CardTitle>
                <CardDescription>
                  Define tiered package options, included decor/features, and
                  custom date rates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PackageForm packages={packages} setPackages={setPackages} />
              </CardContent>
            </Card>
          </div>

          {/* ─── Right Column (1 Col) ───────────────────────────────────── */}
          <div className="space-y-6">
            {/* Card 5: Status & Visibility */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Visibility & Status</CardTitle>
                <CardDescription>
                  Control public booking availability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50/50">
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-gray-900">
                      Screen Status
                    </span>
                    <p className="text-[11px] text-gray-500">
                      {details.status
                        ? "Open for reservations"
                        : "Hidden from public booking"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium border-0 ${
                        details.status
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {details.status ? "Active" : "Inactive"}
                    </Badge>
                    <Switch
                      checked={Boolean(details.status)}
                      onCheckedChange={(checked) =>
                        setDetails((prev) => ({ ...prev, status: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="rounded-md bg-blue-50/60 p-3 border border-blue-100">
                  <div className="flex gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      Deactivating a screen immediately hides it from the public
                      theater booking flow while keeping existing confirmed
                      reservations intact.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 6: Screen Photo Gallery */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  Screen Photo Gallery
                </CardTitle>
                <CardDescription>
                  Upload up to 6 high-resolution photos of the auditorium and
                  seating.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MultiImageGallery
                  images={details.images}
                  onChange={(newImages) =>
                    setDetails((prev) => ({ ...prev, images: newImages }))
                  }
                  maxImages={6}
                />
              </CardContent>
            </Card>

            {/* Card 7: Quick Actions */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button
                  type="submit"
                  form="screen-form"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {update ? "Updating Screen..." : "Creating Screen..."}
                    </>
                  ) : update ? (
                    "Update Screen Configuration"
                  ) : (
                    "Publish Screen"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/admin/screens")}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddScreens;
