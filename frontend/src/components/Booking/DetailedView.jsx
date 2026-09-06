import React from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import DetailedBooking from "./DetailedBooking";
import { useBooking } from "../../hooks/useBookings";

function DetailedView() {
  const { id } = useParams();
  const { data: booking, isLoading } = useBooking(id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs">Loading booking invoice details...</p>
      </div>
    );
  }

  return <DetailedBooking bookingData={booking} />;
}

export default DetailedView;
