import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Users, Phone, Mail, Calendar, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import CustomersFilter from "./CustomersFilter";
import Pagination from "../Pagination/Pagination";
import { useCustomers } from "../../hooks/useCatalog";
import { useAuth } from "../../hooks/useAuth";
import { Card } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";

function Customers() {
  const [params, setParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(
    Number(params.get("page")) || 1
  );
  const [copiedField, setCopiedField] = useState(null);
  const { admin } = useAuth();
  const isSuperAdmin = admin?.role === "superAdmin" || Boolean(admin?.superAdmin);

  const limit = 50;
  const queryParams = { ...Object.fromEntries(params), limit: Number(params.get("limit")) || limit };
  const { data, isLoading } = useCustomers(queryParams);

  const customers = data?.customers || [];
  const noOfDocuments = data?.totalDocuments || 0;

  const handleCopy = (text, fieldKey) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    toast.success(`Copied: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* ── Top Header ── */}
      <div className="pb-3 border-b border-gray-200">
        <h1 className="text-xl font-bold font-sans tracking-tight text-gray-900">Customers</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Registered customer accounts, phone contacts, and booking client directory.
        </p>
      </div>

      {/* ── Filters Toolbar Card ── */}
      <div className="bg-white rounded-2xl p-3 border border-gray-200 shadow-sm">
        <CustomersFilter
          params={params}
          setParams={setParams}
          isSuperAdmin={isSuperAdmin}
        />
      </div>

      {/* ── Stat Pill ── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 bg-white shadow-xs">
          <Users className="w-4 h-4 text-blue-600" />
          <span className="text-xs text-gray-500">Total Registered:</span>
          <span className="text-xs font-semibold text-gray-900">{noOfDocuments}</span>
        </div>
      </div>

      {/* ── Table Card ── */}
      <Card className="border border-gray-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[360px] text-gray-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs">Loading customer directory...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[320px] text-center p-8">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">No customers found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              {params.get("search")
                ? "No customer matches your search criteria. Try a different query or clear filters."
                : "Customer records will appear here as bookings are placed on the platform."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/60 text-gray-500 font-medium uppercase tracking-wider">
                  <th className="px-4 py-3 w-12 text-center">#</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone Number</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {customers.map((customer, index) => {
                  const seqNum = (currentPage - 1) * limit + index + 1;
                  const firstChar = customer.name ? customer.name.charAt(0).toUpperCase() : "?";

                  return (
                    <tr
                      key={customer._id}
                      className="hover:bg-gray-50/70 transition-colors group"
                    >
                      {/* # */}
                      <td className="px-4 py-3 text-center text-gray-400 font-mono text-[11px]">
                        {String(seqNum).padStart(2, "0")}
                      </td>

                      {/* Customer Name + Avatar */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs shrink-0">
                            {firstChar}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 block text-xs">
                              {customer.name}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              ID: {customer._id.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone Number */}
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-800">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span>{customer.number || "—"}</span>
                          {customer.number && (
                            <button
                              type="button"
                              onClick={() => handleCopy(customer.number, `phone-${customer._id}`)}
                              className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Copy phone"
                            >
                              {copiedField === `phone-${customer._id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-800">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span>{customer.email || "—"}</span>
                          {customer.email && (
                            <button
                              type="button"
                              onClick={() => handleCopy(customer.email, `email-${customer._id}`)}
                              className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Copy email"
                            >
                              {copiedField === `email-${customer._id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Registered Date */}
                      <td className="px-4 py-3 text-gray-500">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            {customer.createdAt
                              ? new Date(customer.createdAt).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </span>
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
    </div>
  );
}

export default Customers;
