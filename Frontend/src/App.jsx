import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import PropertyList from "./components/home/PropertyList";
import Main from "./components/home/Main";
import Login from "./components/user/Login";
import Signup from "./components/user/Signup";
import Profile from "./components/user/Profile";
import EditProfile from "./components/user/EditProfile";
import { useState, lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import ForgetPassword from "./components/user/ForgetPassword";
import ResetPassword from "./components/user/ResetPassword";
import UpdatePassword from "./components/user/UpdatePassword";
import NotFound from "./components/NotFound";
import { useDispatch,useSelector } from "react-redux";
import { useEffect } from "react";
import { userAction } from "./store/User/user-slice";
import { currentUser } from "./store/User/user-action";
import { getMyFavorites } from "./store/Favorite/favorite-action";

// Lazy Loaded Components
const PropertyListing = lazy(() => import("./components/propertyListing/PropertyListing"));
const Accomodation = lazy(() => import("./components/accomodation/Accomodation"));
const AccomodationForm = lazy(() => import("./components/accomodation/AccomodationForm"));
const Payment = lazy(() => import("./components/payment/Payment"));
const PaymentStatus = lazy(() => import("./components/payment/PaymentStatus"));
const AiTripPlanner = lazy(() => import("./components/aiTripPlanner/AiTripPlanner"));
const MyBookings = lazy(() => import("./components/myBookings/MyBookings"));
const BookingDetails = lazy(() => import("./components/myBookings/BookingDetails"));
const MyFavorites = lazy(() => import("./components/user/MyFavorites"));
const MyInquiries = lazy(() => import("./components/user/MyInquiries"));
const OwnerAnalytics = lazy(() => import("./components/user/OwnerAnalytics/OwnerAnalytics"));
const AdminAnalytics = lazy(() => import("./components/user/AdminAnalytics/AdminAnalytics"));
const Chat = lazy(() => import("./components/user/Chat/Chat"));

function App() {
  
 const {user,errors}=useSelector(state=>state.user)
 const dispatch=useDispatch()

 useEffect(()=>{
  if(errors){
    dispatch(userAction.clearErrors())
  }
 },[errors,dispatch])
 useEffect(()=>{
  dispatch(currentUser())
  dispatch(getMyFavorites())
 },[dispatch])
  return (
    <div className="App">
      <Toaster position="bottom-center" reverseOrder={false} />
      <Router>
            <Suspense fallback={<div className="loading-fallback">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Main />}>
                  <Route index element={<PropertyList />} />
                  <Route path="propertylist/:id" element={<PropertyListing />} />

                  <Route path="login" element={<Login />} />
                  <Route path="signup" element={<Signup />} />
                  <Route path="profile" element={<Profile />} />
                  <Route
                    path="editprofile"
                    element={user ? <EditProfile /> : <Navigate to="/login" />}
                  />

                  <Route path="ai-trip-planner" element={<AiTripPlanner />} />

                  <Route path="accomodation" element={<Accomodation />} />
                  <Route path="accomodationform" element={<AccomodationForm />} />
                  <Route path="edit-accommodation/:id" element={user ? <AccomodationForm isEdit={true} /> : <Navigate to="/login" />} />

                  <Route path="user/forgotPassword" element={<ForgetPassword />} />
                  <Route
                    path="user/resetPassword/:token"
                    element={<ResetPassword />}
                  />
                  <Route
                    path="user/updatepassword"
                    element={user ? <UpdatePassword /> : <Navigate to="/login" />}
                  />

                  <Route
                    path="user/favorites"
                    element={user ? <MyFavorites /> : <Navigate to="/login" />}
                  />

                  <Route
                    path="user/inquiries"
                    element={user ? <MyInquiries /> : <Navigate to="/login" />}
                  />

                  <Route
                    path="user/mybookings"
                    element={user ? <MyBookings /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="user/mybookings/:bookingId"
                    element={user ? <BookingDetails /> : <Navigate to="/login" />}
                  />

                  <Route
                    path="payment/:propertyId"
                    element={user ? <Payment /> : <Navigate to="/login" />}
                  />

                  <Route
                    path="payment-status"
                    element={user ? <PaymentStatus /> : <Navigate to="/login" />}
                  />
                  
                  <Route
                    path="owner/analytics"
                    element={user ? <OwnerAnalytics /> : <Navigate to="/login" />}
                  />

                  <Route
                    path="admin/analytics"
                    element={user ? <AdminAnalytics /> : <Navigate to="/login" />}
                  />

                  <Route
                    path="chat"
                    element={user ? <Chat /> : <Navigate to="/login" />}
                  />

                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
      </Router>
    </div>
  );
}

export default App;
