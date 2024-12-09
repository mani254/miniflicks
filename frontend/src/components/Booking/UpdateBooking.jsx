import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { connect } from "react-redux";
import Loader from "../Loader/Loader";
import { initialLogin } from "../../redux/auth/authActions";
import { getBooking } from "../../redux/booking/bookingActions";
import { getScreens } from "../../redux/screen/screenActions";
import { setCustomerBooking } from "../../redux/customerBooking/customerBookingActions";
import { showNotification } from "../../redux/notification/notificationActions";

const UpdateBooking = ({ initialLogin, getBooking, getScreens, screensData,setCustomerBooking }) => {
  const [isLoading, setIsLoading] = useState(true); // Tracks whether the app is in a loading state.
  const [booking, setBooking] = useState(null); // Stores the fetched booking data.
  const [isProcessed,setIsProcessed] = useState(false)

  const navigate = useNavigate(); // For programmatic navigation.
  const { id } = useParams(); // Extract booking ID from the URL.

  // Effect to handle booking setup after data is loaded.
  useEffect(() => {
    if (booking && screensData.screens.length > 0 && !isProcessed){
        const localBooking = {
          city: booking.city,
          location: booking.location._id,
          screen: booking.screen._id,
          date: booking.date,
          slot: booking.slot,
          package: booking.package,
          occasion: booking.occasion,
          addons: booking.addons || [],
          gifts: booking.gifts || [],
          cakes: booking.cakes || [],
          customer: booking.customer || null,
          advance: booking.advancePrice || 0,
          note: booking.note || "",
          total: booking.totalPrice || 0,
          otherInfo: {
            numberOfPeople: booking.numberOfPeople || 0,
            nameOnCake: booking.nameOnCake || "",
            ledName: booking.ledName || "",
            ledNumber: booking.ledNumber || "",
            couponCode: booking.couponCode || "",
            couponPrice:booking.couponPrice || 0,
            numberOfExtraPeople: 0,
            extraPersonsPrice: 0,  
          },
          isEditing:true,
          fullPayment:booking.remainingAmount==0,
          id:booking._id
        };
    
        // Retrieve screen-specific details for otherInfo.
        const currentScreen = screensData.screens.find((screen) => screen._id === booking.screen._id);
        
        if (currentScreen) {
          localBooking.otherInfo.numberOfExtraPeople = currentScreen.numberOfExtraPeople || 0;
          localBooking.otherInfo.extraPersonsPrice = currentScreen.extraPersonsPrice || 0;
        }
        else{
            showNotification('invalid screen or screen deleted')
            navigate('/')
        }
    
        setCustomerBooking(localBooking)
        setIsProcessed(true)
        navigate("/booking/customerDetails");
        
    }; // Ensure both booking and screens data are loaded.

 

  }, [booking, screensData.screens]);

  // Effect to handle initial data fetching on mount.
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          await initialLogin(token); 
          await fetchBookingData(); 
          await getScreens(); 
        } else {
          navigate("/booking/locations", { replace: true });
          showNotification('No Access Login again')
        }
      } catch (err) {
        console.error("Error during initialization:", err); 
        navigate("/booking/locations", { replace: true });
        showNotification(err)
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch booking details using the provided booking ID.
    const fetchBookingData = async () => {
      try {
        if (id) {
          const res = await getBooking(id);
          if (res) {
            setBooking(res); // Store the fetched booking.
          } else {
            console.error("Booking not found");
            navigate("/booking/locations", { replace: true });
          }
        } else {
          console.error("No booking ID found in the URL");
          navigate("/booking/locations", { replace: true });
        }
      } catch (err) {
        console.error("Error fetching booking data:", err);
      }
    };

    fetchInitialData();
  }, []);

  // Render loading state or invalid booking message.
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Loader />
        </div>
      )}
      {!isLoading && !booking && (
        <div>
          <h2>Invalid Booking ID</h2>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  screensData: state.screens, // Maps screens data from Redux state.
});

const mapDispatchToProps = (dispatch) => ({
  initialLogin: (token) => dispatch(initialLogin(token)),
  getBooking: (id) => dispatch(getBooking(id)), 
  getScreens: () => dispatch(getScreens()), 
  setCustomerBooking:(booking)=>dispatch(setCustomerBooking(booking))
});

export default connect(mapStateToProps, mapDispatchToProps)(UpdateBooking);
