import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { ArrowLeft, MapPin, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { catalogApi } from "../../api/catalog";
import { Button } from "../ui/button.jsx";
import { Switch } from "../ui/switch.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card.jsx";

function AddCities({ update = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { cities = [], refetch } = useOutletContext() || {};

  const [details, setDetails] = useState({
    name: "",
    status: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (update && cities.length > 0) {
      const currentCity = cities.find((city) => city._id === id);
      if (currentCity) {
        setDetails({
          name: currentCity.name || "",
          status: Boolean(currentCity.status),
        });
      }
    }
  }, [update, cities, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (checked) => {
    setDetails((prev) => ({
      ...prev,
      status: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!details.name.trim()) {
      toast.error("City name is required");
      return;
    }

    setSubmitting(true);
    try {
      if (update) {
        await catalogApi.updateCity(id, details);
        toast.success("City updated successfully");
      } else {
        await catalogApi.addCity(details);
        toast.success("City added successfully");
      }
      refetch?.();
      navigate("/admin/cities");
    } catch (error) {
      toast.error(error.message || "Failed to save city");
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
          onClick={() => navigate("/admin/cities")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {update ? "Update City" : "Add City"}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {update ? "Modify existing city settings" : "Create a new city destination for branches"}
          </p>
        </div>
      </div>

      {/* ── Form Card ── */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">City Details</CardTitle>
            <CardDescription>
              Specify the city name and whether it should be active for bookings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* City Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                City Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={details.name}
                  onChange={handleChange}
                  placeholder="e.g. Hyderabad, Bangalore, Chennai"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Status toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-gray-200 bg-gray-50/50">
              <div>
                <p className="text-sm font-medium text-gray-800">City Status</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  When active, customers can select this city and its branches.
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

            {/* Submit & Cancel Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/cities")}
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
                {submitting ? "Saving…" : update ? "Update City" : "Save City"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

export default AddCities;
