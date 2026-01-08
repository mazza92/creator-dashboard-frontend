import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Modal,
  Tag,
  Spin,
  message,
  Tooltip,
  Popconfirm,
  Alert,
  Card,
  Row,
  Col,
  Table,
  Select,
  notification,
  Form,
  Steps,
  Badge,
  Progress,
  Dropdown,
  Menu,
  Statistic,
  Space,
  Avatar,
} from "antd";
import {
  FaComment,
  FaEye,
  FaUser,
  FaDollarSign,
  FaClock,
  FaCheckCircle,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import styled from "styled-components";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { motion } from "framer-motion";

const stripePromise = loadStripe("pk_live_51RWy7FDtwNxyjY37Zu7EwAMJn03Jn6vSsCcy1ErP7gyzspIBoWM2AISidCUPJIfXggUdHyIIUDupL8ZBFlfH2g6800ggZqg0Iv");

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

// Styled Components (aligned with CreatorBookings)
const Container = styled.div`
  padding: 40px;
  background: #f9fafb;
  min-height: 100vh;
  font-family: "Inter", sans-serif;
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  background: #fff;
  padding: 20px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  background: #fff;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const BookingCard = styled(Card)`
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
  border: none;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 24px;
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
  .ant-card-body {
    padding: 20px;
  }
  @media (max-width: 768px) {
    margin-bottom: 16px;
    .ant-card-body {
      padding: 16px;
    }
  }
`;

const OverviewCard = styled(Card)`
  border-radius: 20px;
  background: linear-gradient(135deg, #26A69A, #4DB6AC);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  text-align: center;
  color: #fff;
  .ant-statistic-title {
    color: #e6f7ff;
    font-size: 14px;
    font-weight: 500;
  }
  .ant-statistic-content {
    color: #fff;
    font-size: 24px;
    font-weight: 700;
  }
  @media (max-width: 768px) {
    .ant-statistic-content {
      font-size: 20px;
    }
  }
`;

const CreatorWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  @media (max-width: 768px) {
    gap: 8px;
  }
  .ant-avatar {
    width: 64px !important;
    height: 64px !important;
    min-width: 64px !important;
    min-height: 64px !important;
    border: 2px solid #e8ecef;
    flex-shrink: 0;
    @media (max-width: 768px) {
      width: 48px !important;
      height: 48px !important;
      min-width: 48px !important;
      min-height: 48px !important;
    }
  }
`;

// eslint-disable-next-line no-unused-vars
const CardContent = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

// eslint-disable-next-line no-unused-vars
const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// eslint-disable-next-line no-unused-vars
const SideContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 200px;
  @media (max-width: 768px) {
    min-width: unset;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  margin-top: 16px;
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const StatusTag = styled(Tag)`
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.gradient};
  border: none;
  color: #fff;
  @media (max-width: 768px) {
    padding: 4px 8px;
    font-size: 11px;
  }
`;

const TypeTag = styled(Tag)`
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.gradient};
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
  @media (max-width: 768px) {
    padding: 4px 8px;
    font-size: 11px;
  }
`;

const StepsWrapper = styled.div`
  margin-top: 12px;
  max-width: 100%;
  .ant-steps-item-title {
    font-size: 12px;
    color: #4b5563;
    white-space: normal;
    line-height: 1.2;
    text-align: center;
    margin-top: 4px;
  }
  .ant-steps-item-icon {
    background: #26A69A;
    border-color: #26A69A;
  }
  .ant-steps-item {
    flex: 1;
    min-width: 0;
    padding-right: 8px;
  }
  .ant-steps-item-content {
    max-width: 100%;
  }
  .ant-steps-item-tail {
    padding: 0 4px;
  }
  .ant-steps-item-tail::after {
    width: 100%;
  }
  @media (max-width: 768px) {
    .ant-steps-item-title {
      font-size: 11px;
    }
  }
`;

const ProgressWrapper = styled.div`
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  .ant-progress-inner {
    background: #e8ecef;
  }
  .ant-progress-bg {
    background: linear-gradient(135deg, #26A69A, #4DB6AC);
  }
  @media (max-width: 768px) {
    gap: 8px;
    .ant-progress-text {
      font-size: 12px;
    }
  }
`;

const CreatorName = styled.p`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const StyledInput = styled(Input)`
  border-radius: 24px;
  padding: 10px 20px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  &:hover,
  &:focus {
    border-color: #26A69A;
    box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.2);
  }
  @media (max-width: 768px) {
    font-size: 13px;
    padding: 8px 16px;
  }
`;

const StyledTextArea = styled(TextArea)`
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 14px;
  &:hover,
  &:focus {
    border-color: #26A69A;
    box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.2);
  }
  @media (max-width: 768px) {
    font-size: 13px;
    padding: 8px 12px;
  }
`;

const StyledButton = styled(Button)`
  border-radius: 24px;
  padding: 10px 24px;
  background: ${props =>
    props.primary ? "linear-gradient(135deg, #26A69A, #4DB6AC)" : "#fff"};
  border: ${props => (props.primary ? "none" : "1px solid #d1d5db")};
  color: ${props => (props.primary ? "#fff" : "#4b5563")};
  font-weight: 600;
  font-size: 14px;
  height: auto;
  &:hover {
    background: ${props =>
      props.primary
        ? "linear-gradient(135deg, #4DB6AC, #26A69A)"
        : "#e6f7ff"};
    color: ${props => (props.primary ? "#fff" : "#26A69A")};
    border-color: ${props => (props.primary ? "none" : "#26A69A")};
  }
  @media (max-width: 768px) {
    font-size: 13px;
    padding: 8px 16px;
  }
`;

const ModalContent = styled.div`
  padding: 24px;
  background: #f9fafb;
  border-radius: 16px;
  font-family: "Inter", sans-serif;
  max-width: 100%;
  overflow-x: auto;
  box-sizing: border-box;
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

// Helper Functions for Styling
const getStatusGradient = status => {
  switch (status?.toLowerCase()) {
    case "active":
      return "linear-gradient(135deg, #22c55e, #16a34a)";
    case "pending":
      return "linear-gradient(135deg, #f59e0b, #d97706)";
    case "completed":
      return "linear-gradient(135deg, #a855f7, #7e22ce)";
    case "on hold":
      return "linear-gradient(135deg, #ef4444, #dc2626)";
    case "submitted":
    case "draft submitted":
      return "linear-gradient(135deg, #3b82f6, #2563eb)";
    case "revision requested":
      return "linear-gradient(135deg, #f87171, #ef4444)";
    case "approved":
      return "linear-gradient(135deg, #10b981, #059669)";
    case "published":
      return "linear-gradient(135deg, #6366f1, #4f46e5)";
    case "confirmed":
      return "linear-gradient(135deg, #3b82f6, #2563eb)";
    default:
      return "linear-gradient(135deg, #9ca3af, #6b7280)";
  }
};

const getTypeGradient = type => {
  switch (type?.toLowerCase()) {
    case "subscription":
      return "linear-gradient(135deg, #f97316, #ea580c)";
    case "one-off partnership":
      return "linear-gradient(135deg, #14b8a6, #0d9488)";
    case "sponsor":
      return "linear-gradient(135deg, #8b5cf6, #7c3aed)";
    default:
      return "linear-gradient(135deg, #9ca3af, #6b7280)";
  }
};

// PaymentForm Component (unchanged)
const PaymentForm = ({ clientSecret, booking, onSuccess, onCancel, isSubscription = false }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      message.error("Stripe not initialized");
      return;
    }
    setLoading(true);
    try {
      console.log(`📌 Initiating Stripe payment for ${isSubscription ? "subscription" : "booking"} ${booking.id || booking.subscription_id}`);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (result.error) {
        message.error(`Payment failed: ${result.error.message}`);
      } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
        console.log(`📌 Stripe payment succeeded for ${isSubscription ? "subscription" : "booking"} ${booking.id || booking.subscription_id}`);
        await onSuccess(result.paymentIntent.id, isSubscription ? booking.subscription_id : booking.id, isSubscription);
        console.log(`📌 onSuccess executed for ${isSubscription ? "subscription" : "booking"} ${booking.id || booking.subscription_id}`);
      } else {
        message.error("Payment did not succeed.");
      }
    } catch (error) {
      console.error("🔥 Payment error:", error);
      message.error("An unexpected error occurred during payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <StyledButton type="primary" primary htmlType="submit" style={{ marginTop: 16 }} loading={loading} disabled={!stripe}>
        Pay Now
      </StyledButton>
      <StyledButton style={{ marginLeft: 8 }} onClick={onCancel}>
        Cancel
      </StyledButton>
    </form>
  );
};

const BrandBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isMessageModalVisible, setIsMessageModalVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [brandId, setBrandId] = useState(null);
  const [filters, setFilters] = useState({ search: "", type: "all" });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [subscriptionPackages, setSubscriptionPackages] = useState([]);
  const [isSubscribeModalVisible, setIsSubscribeModalVisible] = useState(false);
  const [deliverables, setDeliverables] = useState([]);
  const [clientSecret, setClientSecret] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [reviewForm] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();

  const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co');

  useEffect(() => {
    const fetchBrandIdAndData = async () => {
      setLoading(true);
      try {
        const profileResponse = await axios.get(`${API_URL}/profile`, { withCredentials: true });
        console.log(`📌 Profile response:`, profileResponse.data);
        if (profileResponse.data.user_role === "brand") {
          const actualBrandId = profileResponse.data.brand_id || profileResponse.data.id;
          setBrandId(actualBrandId);
          await fetchAllBookings(actualBrandId);
        } else {
          console.error("🔥 User is not a brand:", profileResponse.data.user_role);
          message.error("Please log in as a brand to view bookings.");
          navigate("/login");
        }
      } catch (error) {
        console.error("🔥 Error fetching brand profile:", error.response?.data || error.message);
        message.error("Failed to authenticate. Please log in again.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
  
    fetchBrandIdAndData();
  
    const intervalId = setInterval(() => {
      if (brandId) fetchAllBookings(brandId);
    }, 5000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId, navigate]);

  useEffect(() => {
    if (location.state?.openDetailsModal && location.state?.bookingId) {
      const bookingId = location.state.bookingId;
      console.log(`📌 Navigating to booking ${bookingId} from state`);
      const existingBooking = bookings.find(b => b.id === bookingId);
      if (existingBooking) {
        console.log(`📌 Booking ${bookingId} found in existing data:`, existingBooking);
        showDetailsModal(existingBooking);
      } else {
        console.log(`📌 Fetching details for booking ${bookingId}`);
        fetchBookingDetails(bookingId).then(booking => {
          if (booking) {
            console.log(`📌 Booking ${bookingId} fetched:`, booking);
            setBookings(prev => {
              const updatedBookings = prev.filter(b => b.id !== bookingId);
              return [...updatedBookings, booking];
            });
            showDetailsModal(booking);
          } else {
            console.error(`🔥 Booking ${bookingId} not found or unauthorized`);
            message.error("Booking not found or you lack permission to view it.");
          }
        });
      }
      navigate('/brand/dashboard/bookings', { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, bookings, navigate]);

  const fetchAllBookings = async (id) => {
    if (!id || id === 'undefined') {
      console.error("🔥 Invalid brand_id for fetching bookings:", id);
      message.error("Unable to fetch bookings: Invalid brand ID");
      return;
    }
    try {
      console.log(`🟢 Fetching bookings for brand_id: ${id} from: ${API_URL}/bookings?brand_id=${id}`);
      const bookingsResponse = await axios.get(`${API_URL}/bookings?brand_id=${id}`, { withCredentials: true });
      console.log(`📌 Fetched all bookings for brand ${id}:`, bookingsResponse.data);
      const allBookings = bookingsResponse.data.map((booking) => {
        const bookingType = booking.type || (booking.offer_id ? "One-off Partnership" : "Sponsor");
        const isSubscription = bookingType === "Subscription";
        const cost = isSubscription
          ? (booking.total_cost && booking.duration_months
              ? parseFloat(booking.total_cost / booking.duration_months).toFixed(2)
              : "N/A")
          : bookingType === "One-off Partnership" && booking.price
          ? require('../utils/currency').formatPrice(booking.price)
          : booking.bid_amount
          ? require('../utils/currency').formatPrice(booking.bid_amount)
          : "Awaiting Creator Acceptance";
  
        return {
          id: booking.id,
          type: bookingType,
          subscription_id: isSubscription ? booking.id : null,
          key: `${bookingType.toLowerCase().replace(" ", "-")}-${booking.id}`,
          name: isSubscription
            ? (booking.package_name || `Subscription #${booking.id}`)
            : (booking.product_name || `Booking #${booking.id}`),
          creator: booking.creator_name || "Unknown Creator",
          creator_id: booking.creator_id || null,
          creator_profile: booking.creator_profile || null,
          cost: cost,
          start_date: booking.start_date || booking.created_at || null,
          end_date: booking.end_date || booking.promotion_date || null,
          bidding_deadline: booking.bidding_deadline || null,
          status: booking.status || "Pending",
          content_status: booking.content_status || "Pending",
          unread_count: booking.unread_count || 0,
          content_link: booking.content_link || null,
          file_url: booking.content_file_url || null,
          submission_notes: booking.submission_notes || "",
          revision_notes: booking.revision_notes || "",
          payment_status: booking.payment_status || "On Hold",
          platform: booking.platform || "N/A",
          description: booking.description || "",
          platforms: booking.platforms
            ? typeof booking.platforms === "string" ? JSON.parse(booking.platforms) : booking.platforms
            : [],
          audience_targets: booking.audience_targets
            ? typeof booking.audience_targets === "string" ? JSON.parse(booking.audience_targets) : booking.audience_targets
            : [],
          topics: booking.topics
            ? typeof booking.topics === "string" ? JSON.parse(booking.topics) : booking.topics
            : [],
          payment_method: booking.payment_method || "stripe",
          bid_amount: booking.bid_amount || null,
          price: booking.price || null,
          updated_at: booking.updated_at || booking.created_at || new Date().toISOString(),
          deliverables: booking.deliverables || [],
          brand_id: booking.brand_id || id
        };
      }).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      setBookings(allBookings);
    } catch (error) {
      console.error("🔥 Error fetching bookings:", error.response?.data || error.message);
      message.error("Failed to fetch bookings.");
    }
  };

  const fetchBookingDetails = async (bookingId) => {
    try {
      const response = await axios.get(`${API_URL}/bookings/${bookingId}`, { withCredentials: true });
      const booking = response.data;
      console.log(`📌 Fetched booking details for ${bookingId}:`, booking);
      const isSubscription = booking.type === "Subscription";
      return {
        id: booking.id,
        type: booking.type || "Sponsor",
        subscription_id: isSubscription ? booking.id : null,
        key: `${(booking.type || "sponsor").toLowerCase()}-${booking.id}`,
        name: isSubscription
          ? (booking.package_name || `Subscription #${booking.id}`)
          : (booking.product_name || `Booking #${booking.id}`),
        creator: booking.creator_name || "Unknown Creator",
        creator_id: booking.creator_id || null,
        creator_profile: booking.creator_profile || null,
        cost: isSubscription
          ? (booking.total_cost && booking.duration_months
              ? parseFloat(booking.total_cost / booking.duration_months).toFixed(2)
              : "N/A")
          : (booking.bid_amount ? require('../utils/currency').formatPrice(booking.bid_amount) : "Awaiting Creator Acceptance"),
        start_date: booking.start_date || booking.created_at || null,
        end_date: booking.end_date || booking.promotion_date || null,
        bidding_deadline: booking.bidding_deadline || null,
        status: booking.status || "Pending",
        content_status: booking.content_status || "Pending",
        unread_count: booking.unread_count || 0,
        content_link: booking.content_link || null,
        file_url: booking.content_file_url || null,
        submission_notes: booking.submission_notes || "",
        revision_notes: booking.revision_notes || "",
        payment_status: booking.payment_status || "On Hold",
        platform: booking.platform || "N/A",
        description: booking.description || "",
        platforms: booking.platforms
          ? (typeof booking.platforms === "string" ? JSON.parse(booking.platforms) : booking.platforms)
          : [],
        audience_targets: booking.audience_targets
          ? (typeof booking.audience_targets === "string" ? JSON.parse(booking.audience_targets) : booking.audience_targets)
          : [],
        topics: booking.topics
          ? (typeof booking.topics === "string" ? JSON.parse(booking.topics) : booking.topics)
          : [],
        payment_method: booking.payment_method || "stripe",
        bid_amount: booking.bid_amount || null,
        price: booking.price || null,
        updated_at: booking.updated_at || booking.created_at || new Date().toISOString(),
        deliverables: booking.deliverables || [],
        brand_id: booking.brand_id || brandId
      };
    } catch (error) {
      console.error("🔥 Error fetching booking details:", error.response?.data || error.message);
      if (error.response?.status === 403) {
        message.error("You do not have permission to view this booking.");
      } else if (error.response?.status === 404) {
        message.error("Booking not found.");
      } else {
        message.error("Failed to fetch booking details.");
      }
      return null;
    }
  };

  const fetchDeliverables = (booking) => {
    console.log(`📌 Entering fetchDeliverables for booking ${booking?.id}:`, booking);
    try {
      if (!booking) {
        console.error("🔥 No booking data provided to fetchDeliverables");
        setDeliverables([]);
        return;
      }
      if (booking.type === "Subscription") {
        const deliverablesData = booking.deliverables || [];
        setDeliverables(deliverablesData);
        console.log(`📌 Set subscription deliverables:`, deliverablesData);
      } else {
        const deliverablesData = [{
          type: booking.name || "Sponsored Content",
          quantity: 1,
          platform: booking.platform || "N/A",
          status: booking.status || "Pending",
          delivery_date: ["Published", "Approved", "Completed"].includes(booking.status) ? (booking.updated_at || booking.end_date) : null,
          submissions: [{
            content_link: booking.content_link || null,
            file_url: booking.content_file_url || null,
            submission_notes: booking.submission_notes || ""
          }]
        }];
        setDeliverables(deliverablesData);
        console.log(`📌 Set sponsorship deliverables:`, deliverablesData);
      }
    } catch (error) {
      console.error("🔥 Error in fetchDeliverables:", error.message);
      setDeliverables([]);
      message.error("Failed to process deliverables for this booking.");
    }
  };

  const calculateOverviewStats = () => {
    console.log("📊 Starting total spend calculation with bookings:", bookings);
    
    const totalSpend = bookings.reduce((sum, b) => {
      let cost = 0;
      
      // Log each booking's details
      console.log(`📊 Processing booking:`, {
        id: b.id,
        type: b.type,
        cost: b.cost,
        bid_amount: b.bid_amount,
        price: b.price,
        payment_status: b.payment_status,
        status: b.status
      });
      
      // Handle subscription costs
      if (b.type === "Subscription" && b.cost) {
        cost = parseFloat(b.cost.replace(/[€$£¥]/g, '')) || 0;
        console.log(`📊 Subscription cost for ${b.id}:`, cost);
      }
      // Handle one-off partnership costs
      else if (b.type === "One-off Partnership" && b.price) {
        cost = parseFloat(b.price) || 0;
        console.log(`📊 One-off cost for ${b.id}:`, cost);
      }
      // Handle sponsor costs
      else if (b.type === "Sponsor" && b.bid_amount) {
        cost = parseFloat(b.bid_amount) || 0;
        console.log(`📊 Sponsor cost for ${b.id}:`, cost);
      }

      // Include all bookings in total spend
      console.log(`📊 Adding cost ${cost} to total for booking ${b.id}`);
      return sum + cost;
    }, 0);

    console.log("📊 Final total spend:", totalSpend);

    const activeCollaborations = bookings.filter(b => !["Completed", "Canceled"].includes(b.status)).length;
    
    // Count all bookings that need brand action
    const pendingReviews = bookings.filter(b => {
      const status = b.content_status || b.status;
      return ["Submitted", "Draft Submitted", "Revision Requested"].includes(status);
    }).length;
    
    // Calculate completion rate based on final states
    const totalDeliverables = bookings.length; // Total number of bookings
    const completedDeliverables = bookings.filter(b => 
      ["Completed", "Published"].includes(b.status)
    ).length;
    const completionRate = totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0;

    console.debug(`📊 Stats calculated: Total Spend: ${require('../utils/currency').formatPrice(totalSpend)}, Active: ${activeCollaborations}, Pending Reviews: ${pendingReviews}, Completion Rate: ${completionRate}%`);

    return { totalSpend, activeCollaborations, pendingReviews, completionRate };
  };

  const overviewStats = calculateOverviewStats();

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const showReplyModal = async (booking) => {
    setSelectedBooking(booking);
    setIsMessageModalVisible(true);
    try {
      const endpoint =
        booking.type === "Subscription"
          ? `${API_URL}/messages/subscription/${booking.id}`
          : `${API_URL}/messages/booking/${booking.id}`;
      const response = await axios.get(endpoint, { withCredentials: true });
      setMessages(response.data || []);
      fetchAllBookings(brandId);
    } catch (error) {
      console.error("🔥 Error fetching messages:", error.response?.data || error.message);
      message.error("Failed to load messages.");
    }
  };

  const handleSendReply = async () => {
    if (!currentMessage.trim()) {
      message.warning("Please type a message before sending.");
      return;
    }
    try {
      const endpoint =
        selectedBooking.type === "Subscription"
          ? `${API_URL}/messages/subscription/${selectedBooking.id}`
          : `${API_URL}/messages/booking/${selectedBooking.id}`;
      await axios.post(endpoint, { message: currentMessage, sender_type: "brand" }, { withCredentials: true });
      setMessages([...messages, { sender_type: "brand", message: currentMessage, created_at: new Date() }]);
      setCurrentMessage("");
      message.success("Message sent successfully!");
      fetchAllBookings(brandId);
    } catch (error) {
      console.error("🔥 Error sending reply:", error.response?.data || error.message);
      message.error("Failed to send message. Please try again.");
    }
  };
  

  const fetchCreatorPackages = async (creatorId) => {
    try {
      const response = await axios.get(`${API_URL}/creators/${creatorId}/offers`, { withCredentials: true });
      const subscriptionOffers = response.data.filter(offer => offer.frequency);
      setSubscriptionPackages(subscriptionOffers);
      setIsSubscribeModalVisible(true);
    } catch (error) {
      console.error("🔥 Error fetching subscription packages:", error.response?.data || error.message);
      message.error("Failed to load subscription packages.");
    }
  };

  const handleSubscribe = async (packageId, durationMonths, paymentMethod = "stripe") => {
    try {
      setLoading(true);
      console.log(`🟢 Initiating subscription for package ${packageId} with method: ${paymentMethod}`);
      const response = await axios.post(
        `${API_URL}/subscriptions/${packageId}/subscribe`,
        { payment_method: paymentMethod },
        { withCredentials: true }
      );
      console.log("📌 Subscription response:", response.data);
      const { subscription_id, payment } = response.data;
  
      if (paymentMethod === "stripe") {
        if (!payment.client_secret) {
          throw new Error("No client secret provided by the server");
        }
        localStorage.setItem("pendingSubscriptionId", subscription_id);
        localStorage.setItem("pendingPaymentIntentId", payment.payment_intent_id || "");
        setSelectedBooking({ subscription_id, type: "Subscription", brand_id: brandId });
        setClientSecret(payment.client_secret);
        setIsPaymentModalVisible(true);
      } else if (paymentMethod === "paypal") {
        if (!payment.approval_url) {
          throw new Error("No PayPal approval URL provided by the server");
        }
        localStorage.setItem("pendingSubscriptionId", subscription_id);
        window.location.href = payment.approval_url;
      } else {
        throw new Error("Unsupported payment method");
      }
      setIsSubscribeModalVisible(false);
    } catch (error) {
      console.error("🔥 Error subscribing:", error.response?.data || error.message);
      message.error(`Failed to initiate subscription: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleCancelSubscription = async (subscriptionId) => {
    try {
      await axios.put(`${API_URL}/subscriptions/${subscriptionId}/cancel`, {}, { withCredentials: true });
      message.success("Subscription canceled.");
      fetchAllBookings(brandId);
    } catch (error) {
      console.error("🔥 Error canceling subscription:", error.response?.data || error.message);
      message.error("Failed to cancel subscription.");
    }
  };

  const handleReviewContent = async (values) => {
    try {
      if (selectedBooking.type === "Subscription") {
        message.info("Please use the chat to provide feedback for subscription deliverables.");
        setIsReviewModalVisible(false);
        return;
      }
      const action = values.action === "approve" ? "approve" : "request_revision";
      const payload = {
        action,
        revision_notes: values.action === "revision" ? values.revision_notes : null,
      };
      console.debug(`🟢 Submitting review for booking ${selectedBooking.id}:`, payload);
      const response = await axios.post(
        `${API_URL}/approve-content/${selectedBooking.id}`,
        payload,
        { withCredentials: true }
      );
      console.debug(`📌 Review submission response:`, response.data);
      notification.success({
        message: `Content ${action === "approve" ? "approved" : "revision requested"} successfully!`,
      });
      setIsReviewModalVisible(false);
      reviewForm.resetFields();
      await fetchAllBookings(brandId);
    } catch (error) {
      console.error("🔥 Error reviewing content:", error.response?.data || error.message);
      message.error("Failed to review content. Please try again.");
    }
  };
  
  const handleConfirmPublished = async (paymentMethod, booking) => {
    if (!booking || !booking.id || !booking.brand_id) {
      console.error("🔥 Invalid booking data:", booking);
      message.error("Invalid booking data. Please ensure a booking is created first.");
      return;
    }
  
    try {
      setLoading(true);
      console.log(`🟢 Initiating payment for booking ${booking.id} with method: ${paymentMethod}, type: ${booking.type}`);
  
      // Validate booking type
      if (!booking.type) {
        throw new Error("Booking type is missing");
      }
  
      const supportedBookingTypes = ['Sponsor', 'Campaign Invite'];
      if (!supportedBookingTypes.includes(booking.type)) {
        message.error(`Booking type "${booking.type}" is not supported for payments in the current version. Please contact support at team@newcollab.co.`);
        return;
      }
  
      const paymentPayload = { 
        amount: Math.round(parseFloat(booking.price || booking.bid_amount || 0) * 100),
        creator_id: booking.creator_id,
        booking_id: booking.id,
        booking_type: booking.type, // Send exact type: 'Sponsor' or 'Campaign Invite'
      };
  
      console.debug("📌 Payment payload:", paymentPayload);
  
      if (paymentMethod !== "stripe") {
        throw new Error("Only Stripe payments are supported in the current version.");
      }
  
      const paymentResponse = await axios.post(
        `${API_URL}/create-stripe-payment`,
        paymentPayload,
        { withCredentials: true }
      );
      console.log("📌 Stripe payment response:", paymentResponse.data);
      setSelectedBooking({ ...booking, payment_status: "Pending", brand_id: brandId });
      setClientSecret(paymentResponse.data.client_secret);
      setIsPaymentModalVisible(true);
    } catch (error) {
      console.error("🔥 Payment initiation error:", error.response?.data || error);
      let errorMessage = "Failed to initiate payment. Please try again.";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message === "Booking type is missing") {
        errorMessage = "Booking type is not specified. Please ensure the booking is correctly configured.";
      } else if (error.message.includes("Only Stripe payments")) {
        errorMessage = error.message;
      }
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  
  const handlePaymentSuccess = async (paymentIntentId, id, isSubscription = false) => {
    setPaymentLoading(true);
    try {
      console.log(`🟢 Completing payment for ${isSubscription ? "subscription" : "booking"} ${id} with intent ${paymentIntentId}`);
      if (!id) {
        throw new Error(`${isSubscription ? "Subscription" : "Booking"} ID is undefined`);
      }
      const endpoint = isSubscription
        ? `${API_URL}/subscriptions/${id}/complete-payment`
        : `${API_URL}/bookings/${id}/complete-payment`;
      const response = await axios.post(
        endpoint,
        { payment_intent_id: paymentIntentId },
        { withCredentials: true }
      );
      console.log(`📌 Payment completed successfully:`, response.data);
      message.success(`${isSubscription ? "Subscription" : "Booking"} payment completed successfully!`);
      await fetchAllBookings(brandId);
      setIsPaymentModalVisible(false);
      setClientSecret(null);
      setSelectedBooking(null);
      localStorage.removeItem("pendingSubscriptionId");
      localStorage.removeItem("pendingPaymentIntentId");
    } catch (error) {
      console.error("🔥 Payment error:", error.response?.data || error);
      message.error(`Failed to complete payment: ${error.response?.data?.error || error.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };
  

  const handleConfirmContent = async (booking) => {
    try {
      setLoading(true);
      if (!booking.brand_id || booking.brand_id === 'undefined') {
        console.error(`🔥 Invalid brand_id for booking ${booking.id}:`, booking.brand_id);
        throw new Error("Invalid brand ID");
      }
      console.log(`🟢 Confirming content for subscription ${booking.id}, brand_id: ${booking.brand_id}`);
      await axios.post(
        `${API_URL}/subscriptions/${booking.id}/confirm-content`,
        { deliverable_ids: booking.deliverables.filter(d => d.status === "Submitted").map(d => d.index) },
        { withCredentials: true }
      );
      message.success("Content confirmed successfully!");
      fetchAllBookings(booking.brand_id);
    } catch (error) {
      console.error("🔥 Error confirming content:", error.response?.data || error.message);
      message.error("Failed to confirm content.");
    } finally {
      setLoading(false);
    }
  };
  

  const showDetailsModal = async (booking) => {
    console.log(`📌 Showing details modal for booking ${booking.id}:`, booking);
    setSelectedBooking(booking);
    
    // Fetch fresh data for the booking
    const freshBookingData = await fetchBookingDetails(booking.id);
    if (freshBookingData) {
      console.log(`📌 Fresh booking data:`, freshBookingData);
      setSelectedBooking(freshBookingData);
      fetchDeliverables(freshBookingData);
    } else {
      console.error(`🔥 Failed to fetch fresh data for booking ${booking.id}`);
      message.error("Failed to load booking details. Please try again.");
    }
    
    setIsDetailsModalVisible(true);
  };

  const showReviewModal = async (booking) => {
    setSelectedBooking(booking);
    setIsReviewModalVisible(true);
    reviewForm.setFieldsValue({ revision_notes: booking.revision_notes || "" });
    try {
      const response = await axios.get(`${API_URL}/bookings/${booking.id}`, { withCredentials: true });
      const updatedBooking = {
        ...booking,
        content_link: response.data.content_link || null,
        file_url: response.data.content_file_url || null,
        submission_notes: response.data.submission_notes || "",
        revision_notes: response.data.revision_notes || "",
        status: response.data.content_status || response.data.status || booking.status,
      };
      console.debug(`🟢 Fetched booking ${booking.id} for review:`, updatedBooking);
      setSelectedBooking(updatedBooking);
      reviewForm.setFieldsValue({ revision_notes: updatedBooking.revision_notes || "" });
    } catch (error) {
      console.error("🔥 Error fetching booking details for review:", error.response?.data || error.message);
      message.error("Failed to load draft content for review.");
    }
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      (booking.creator.toLowerCase().includes(filters.search.toLowerCase()) ||
        booking.name.toLowerCase().includes(filters.search.toLowerCase())) &&
      (filters.type === "all" || booking.type === filters.type)
  );

  const deliverablesColumns = [
    { title: "Type", dataIndex: "type", key: "type" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <StatusTag gradient={getStatusGradient(status)}>
          {status}
        </StatusTag>
      ),
    },
    {
      title: "Submissions",
      dataIndex: "submissions",
      key: "submissions",
      render: (submissions) => (
        <div>
          {submissions && submissions.length > 0 ? (
            submissions.map((sub, index) => (
              <div key={index} style={{ marginBottom: 8 }}>
                {sub.content_link && (
                  <p><strong>Link:</strong> <a href={sub.content_link} target="_blank" rel="noopener noreferrer">{sub.content_link}</a></p>
                )}
                {sub.file_url && (
                  <p><strong>File:</strong> <a href={sub.file_url} target="_blank" rel="noopener noreferrer">View File</a></p>
                )}
                {sub.submission_notes && (
                  <p><strong>Notes:</strong> <span style={{ color: "#888" }}>{sub.submission_notes}</span></p>
                )}
              </div>
            ))
          ) : (
            <span>No submissions yet</span>
          )}
        </div>
      ),
    },
  ];

  const sponsorSteps = [
    { title: "Bid Accepted" },
    { title: "Content Submitted" },
    { title: "Revision Requested" },
    { title: "Approved" },
    { title: "Published" },
    { title: "Completed" },
  ];

  const getCurrentStep = (status) => {
    switch (status) {
      case "Confirmed": return 0;
      case "Submitted":
      case "Draft Submitted": return 1;
      case "Revision Requested": return 2;
      case "Approved": return 3;
      case "Published": return 4;
      case "Completed": return 5;
      default: return 0;
    }
  };

  const calculateSubscriptionProgress = (deliverables) => {
    if (!Array.isArray(deliverables)) return { delivered: 0, total: 0, percent: 0 };
    const total = deliverables.reduce((sum, d) => sum + (d.quantity || 0), 0);
    const delivered = deliverables.reduce((sum, d) => sum + (d.submitted || 0), 0);
    const percent = total > 0 ? Math.round((delivered / total) * 100) : 0;
    return { delivered, total, percent };
  };

  const renderBookingCard = (booking) => {
    const isSubscription = booking.type === "Subscription";
    // eslint-disable-next-line no-unused-vars
    const isOneOff = booking.type === "One-off Partnership";
    const progress = isSubscription ? calculateSubscriptionProgress(booking.deliverables) : null;
    const isCompleted = booking.payment_status === 'Completed' || booking.status === 'Completed';
    const hasSubmittedDeliverables = isSubscription && booking.deliverables?.some(d => d.status === "Submitted");

    console.log(`📌 Rendering booking: id=${booking.id}, type=${booking.type}, status=${booking.status}, payment_status=${booking.payment_status}, hasSubmittedDeliverables=${hasSubmittedDeliverables}, brand_id=${booking.brand_id}`);

    // Remove PayPal from payment menu
    const paymentMenu = (
      <Menu>
        <Menu.Item key="stripe" onClick={() => handleConfirmPublished("stripe", booking)}>
          Pay with Stripe
        </Menu.Item>
      </Menu>
    );

    return (
      <motion.div variants={cardVariants} initial="hidden" animate="visible">
        <BookingCard>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12}>
              <CreatorWrapper>
                <Avatar
                  src={booking.creator_profile || "https://via.placeholder.com/40"}
                  size={40}
                  style={{ border: "2px solid #e8ecef", flexShrink: 0 }}
                  onError={() => {
                    console.log(`📌 Failed to load avatar for creator ${booking.creator_id}`);
                    return true;
                  }}
                />
                <CreatorName>
                  <Link to={`/creator/profile/${booking.creator_id}`} style={{ color: "#26A69A" }}>
                    {booking.creator || "Unknown Creator"}
                  </Link>
                </CreatorName>
              </CreatorWrapper>
              <Space size={8} wrap>
                <TypeTag gradient={getTypeGradient(booking.type)}>
                  {isSubscription ? <FaUser /> : <FaDollarSign />}
                  {booking.type}
                </TypeTag>
                <StatusTag gradient={getStatusGradient(booking.content_status)}>
                  {booking.content_status}
                </StatusTag>
              </Space>
              {isSubscription ? (
                <ProgressWrapper>
                  <Progress
                    percent={progress.percent}
                    size="small"
                    status={progress.percent === 100 ? "success" : "active"}
                  />
                  <span style={{ fontSize: "12px", color: "#4b5563" }}>{`${progress.delivered}/${progress.total} Delivered`}</span>
                </ProgressWrapper>
              ) : (
                <StepsWrapper>
                  <Steps
                    current={getCurrentStep(booking.content_status)}
                    status={isCompleted ? "finish" : "process"}
                    size="small"
                    labelPlacement="vertical"
                  >
                    {sponsorSteps.map((step) => (
                      <Step key={step.title} title={step.title} />
                    ))}
                  </Steps>
                </StepsWrapper>
              )}
            </Col>
            <Col xs={24} md={8}>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "#1f2937" }}>
                {booking.type === "Subscription" ? `${require('../utils/currency').formatPrice(booking.cost)}/month` : booking.cost}
              </div>
              <div style={{ fontSize: "12px", color: "#4b5563" }}>
                Due {moment(booking.end_date).format("MMM D, YYYY")}
              </div>
              {booking.content_link && (
                <div style={{ fontSize: "12px" }}>
                  <a href={booking.content_link.startsWith('http') ? booking.content_link : `https://${booking.content_link}`} target="_blank" rel="noopener noreferrer" style={{ color: "#26A69A" }}>
                    View Content
                  </a>
                </div>
              )}
              <div style={{ fontSize: "12px", color: "#4b5563" }}>
                Updated: {moment(booking.updated_at).fromNow()}
              </div>
            </Col>
            <Col xs={24} md={4}>
              <Actions>
                <Tooltip title="Messages">
                  <Badge count={booking.unread_count || 0}>
                    <motion.div variants={buttonVariants} whileHover="hover">
                      <FaComment
                        onClick={() => showReplyModal(booking)}
                        style={{ cursor: "pointer", fontSize: "18px", color: "#4b5563" }}
                      />
                    </motion.div>
                  </Badge>
                </Tooltip>
                <Tooltip title="Details">
                  <motion.div variants={buttonVariants} whileHover="hover">
                    <FaEye
                      onClick={() => showDetailsModal(booking)}
                      style={{ cursor: "pointer", fontSize: "18px", color: "#4b5563" }}
                    />
                  </motion.div>
                </Tooltip>
                {(booking.type === "Sponsor" || booking.type === "One-off Partnership") && 
                 booking.content_status === "Published" && 
                 (booking.payment_status === "On Hold" || booking.payment_status === "Pending") && (
                  <Tooltip title="Complete Payment">
                    <Dropdown overlay={paymentMenu} trigger={['click']}>
                      <motion.div variants={buttonVariants} whileHover="hover">
                        <StyledButton
                          type="primary"
                          primary
                          size="small"
                          disabled={!booking.bid_amount && !booking.price}
                          loading={loading && selectedBooking?.id === booking.id}
                        >
                          Pay Now
                        </StyledButton>
                      </motion.div>
                    </Dropdown>
                  </Tooltip>
                )}
                {booking.type === "Subscription" && 
                 booking.status === "Pending" && 
                 booking.transaction_id && (
                  <Tooltip title="Complete Subscription Payment">
                    <Dropdown overlay={paymentMenu} trigger={['click']}>
                      <motion.div variants={buttonVariants} whileHover="hover">
                        <StyledButton type="primary" primary size="small" loading={loading}>
                          Pay Now
                        </StyledButton>
                      </motion.div>
                    </Dropdown>
                  </Tooltip>
                )}
                {booking.type === "Subscription" && 
                 booking.status === "active" && 
                 hasSubmittedDeliverables && (
                  <Tooltip title="Confirm Content">
                    <motion.div variants={buttonVariants} whileHover="hover">
                      <StyledButton type="primary" primary size="small" onClick={() => handleConfirmContent(booking)} loading={loading}>
                        Confirm Content
                      </StyledButton>
                    </motion.div>
                  </Tooltip>
                )}
                {booking.type === "Subscription" && (
                  <>
                    <Tooltip title="Extend Subscription">
                      <motion.div variants={buttonVariants} whileHover="hover">
                        <FaEdit
                          onClick={() => fetchCreatorPackages(booking.creator_id)}
                          style={{ cursor: "pointer", fontSize: "18px", color: "#4b5563" }}
                        />
                      </motion.div>
                    </Tooltip>
                    <Popconfirm
                      title="Cancel this subscription?"
                      onConfirm={() => handleCancelSubscription(booking.id)}
                      okText="Yes"
                      cancelText="No"
                      placement="topRight"
                    >
                      <Tooltip title="Cancel Subscription">
                        <motion.div variants={buttonVariants} whileHover="hover">
                          <FaTrash style={{ cursor: "pointer", fontSize: "18px", color: "#ef4444" }} />
                        </motion.div>
                      </Tooltip>
                    </Popconfirm>
                  </>
                )}
                {(booking.type === "Sponsor" || booking.type === "One-off Partnership") && 
                 (booking.content_status === "Submitted" || booking.content_status === "Draft Submitted") && (
                  <Tooltip title="Review Content">
                    <motion.div variants={buttonVariants} whileHover="hover">
                      <FaEdit
                        onClick={() => showReviewModal(booking)}
                        style={{ cursor: "pointer", fontSize: "18px", color: "#4b5563" }}
                      />
                    </motion.div>
                  </Tooltip>
                )}
              </Actions>
            </Col>
          </Row>
        </BookingCard>
      </motion.div>
    );
  };

  // eslint-disable-next-line no-unused-vars
  const getMessagesEndpoint = (booking) => {
    return booking.type === 'subscription'
      ? `/messages/subscription/${booking.id}`
      : `/messages/booking/${booking.id}`;
  };

  return (
    <Container>
      <Header>
        <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#1f2937", margin: 0 }}>
          Brand Dashboard
        </h2>
        <StyledInput
          placeholder="Search bookings..."
          prefix={<SearchOutlined style={{ color: "#4b5563" }} />}
          value={filters.search}
          onChange={e => handleFilterChange("search", e.target.value)}
          style={{ width: 300 }}
          aria-label="Search bookings"
        />
      </Header>
      <Alert
        message="Your Collaborations"
        description="Track your sponsorships and subscriptions here!"
        type="info"
        showIcon
        style={{
          marginBottom: 24,
          borderRadius: 12,
          background: "#e6f7ff",
          border: "none",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        }}
      />
      {loading ? (
        <Spin style={{ display: "block", textAlign: "center", marginTop: 50 }} />
      ) : (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
            <Col xs={24} sm={12} md={6}>
              <motion.div variants={cardVariants} initial="hidden" animate="visible">
                <OverviewCard>
                  <Statistic
                    title="Total Spend"
                    value={overviewStats.totalSpend}
                    prefix={require('../utils/currency').getCurrencySymbol()}
                  />
                </OverviewCard>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <motion.div variants={cardVariants} initial="hidden" animate="visible">
                <OverviewCard>
                  <Statistic
                    title="Active Collaborations"
                    value={overviewStats.activeCollaborations}
                    prefix={<FaUser />}
                  />
                </OverviewCard>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <motion.div variants={cardVariants} initial="hidden" animate="visible">
                <OverviewCard>
                  <Statistic
                    title="Pending Reviews"
                    value={overviewStats.pendingReviews}
                    prefix={<FaClock />}
                  />
                </OverviewCard>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <motion.div variants={cardVariants} initial="hidden" animate="visible">
                <OverviewCard>
                  <Statistic
                    title="Completion Rate"
                    value={overviewStats.completionRate}
                    suffix="%"
                    prefix={<FaCheckCircle />}
                  />
                </OverviewCard>
              </motion.div>
            </Col>
          </Row>
          <FilterBar>
            <Search
              placeholder="Search by creator or name"
              onSearch={(value) => handleFilterChange("search", value)}
              style={{ width: 300 }}
              aria-label="Search bookings"
            />
            <Select
              defaultValue="all"
              style={{ width: 150 }}
              onChange={(value) => handleFilterChange("type", value)}
              aria-label="Filter by type"
            >
              <Option value="all">All</Option>
              <Option value="Subscription">Subscriptions</Option>
              <Option value="Sponsor">Sponsorships</Option>
              <Option value="One-off Partnership">One-off Partnerships</Option>
            </Select>
          </FilterBar>
          {filteredBookings.length > 0 ? (
            filteredBookings.map(renderBookingCard)
          ) : (
            <p style={{ textAlign: "center", color: "#4b5563", fontSize: "16px" }}>
              No active bookings found.
            </p>
          )}
        </>
      )}

      <Modal
        title={
          <span style={{ fontSize: "20px", fontWeight: 600, color: "#1f2937" }}>
            {selectedBooking ? `Details: ${selectedBooking.creator}` : "Booking Details"}
          </span>
        }
        open={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        footer={[
          <StyledButton
            key="close"
            onClick={() => setIsDetailsModalVisible(false)}
            aria-label="Close details modal"
          >
            Close
          </StyledButton>,
        ]}
        width={600}
        bodyStyle={{ background: "#f9fafb", borderRadius: 16 }}
      >
        <ModalContent>
          {selectedBooking ? (
            <div style={{ lineHeight: "1.8", color: "#4b5563" }}>
              <p>
                <strong>Type:</strong>{" "}
                <TypeTag gradient={getTypeGradient(selectedBooking.type)}>
                  {selectedBooking.type}
                </TypeTag>
              </p>
              <CreatorWrapper>
                <Avatar
                  src={selectedBooking.creator_profile || "https://via.placeholder.com/40"}
                  size={40}
                  style={{ border: "2px solid #e8ecef" }}
                />
                <CreatorName>
                  <strong>Creator:</strong>{" "}
                  <Link to={`/creator/profile/${selectedBooking.creator_id}`} style={{ color: "#26A69A" }}>
                    {selectedBooking.creator}
                  </Link>
                </CreatorName>
              </CreatorWrapper>
              <p><strong>Title:</strong> {selectedBooking.name || "N/A"}</p>
              <p>
                <strong>Cost:</strong>{" "}
                {selectedBooking.type === "Subscription"
                  ? `${require('../utils/currency').formatPrice(selectedBooking.cost)}/month`
                  : selectedBooking.cost}
              </p>
              <p><strong>Start Date:</strong> {selectedBooking.start_date ? moment(selectedBooking.start_date).format("YYYY-MM-DD") : "N/A"}</p>
              <p><strong>End Date:</strong> {selectedBooking.end_date ? moment(selectedBooking.end_date).format("YYYY-MM-DD") : "N/A"}</p>
              <p>
                <strong>Status:</strong>{" "}
                <StatusTag gradient={getStatusGradient(selectedBooking.content_status)}>
                  {selectedBooking.content_status}
                </StatusTag>
              </p>
              {selectedBooking.content_link && (
                <p>
                  <strong>Content:</strong>{" "}
                  <a
                    href={selectedBooking.content_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#26A69A" }}
                  >
                    {selectedBooking.content_link}
                  </a>
                </p>
              )}
              {selectedBooking.file_url && (
                <p>
                  <strong>File:</strong>{" "}
                  <a
                    href={selectedBooking.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#26A69A" }}
                  >
                    View File
                  </a>
                </p>
              )}
              {selectedBooking.submission_notes && (
                <p><strong>Notes:</strong> {selectedBooking.submission_notes}</p>
              )}
              {selectedBooking.revision_notes && (
                <p>
                  <strong>Feedback:</strong>{" "}
                  <span style={{ color: "#ef4444" }}>
                    {selectedBooking.revision_notes}
                  </span>
                </p>
              )}
              <h3 style={{ marginTop: 16, fontSize: "18px", color: "#1f2937" }}>
                Progress
              </h3>
              <StepsWrapper>
                <Steps
                  current={getCurrentStep(selectedBooking.content_status)}
                  status={selectedBooking.status === "Completed" ? "finish" : "process"}
                  size="small"
                  labelPlacement="vertical"
                >
                  {sponsorSteps.map(step => (
                    <Step key={step.title} title={step.title} />
                  ))}
                </Steps>
              </StepsWrapper>
              <h3 style={{ marginTop: 16, fontSize: "18px", color: "#1f2937" }}>
                Deliverables
              </h3>
              <div style={{ overflowX: "auto", maxWidth: "100%" }}>
                <Table
                  columns={deliverablesColumns}
                  dataSource={deliverables}
                  pagination={false}
                  rowKey={(record, index) => index}
                  size="small"
                  style={{ background: "#fff", borderRadius: 12, minWidth: 500 }}
                  scroll={{ x: "max-content" }}
                />
              </div>
            </div>
          ) : (
            <p>Loading details...</p>
          )}
        </ModalContent>
      </Modal>

      <Modal
        title={
          <span style={{ fontSize: "20px", fontWeight: 600, color: "#1f2937" }}>
            {selectedBooking ? `Chat with ${selectedBooking.creator}` : "Chat"}
          </span>
        }
        open={isMessageModalVisible}
        onCancel={() => setIsMessageModalVisible(false)}
        footer={null}
        width={500}
        bodyStyle={{ background: "#f9fafb", borderRadius: 16 }}
      >
        <ModalContent>
          <div style={{ display: "flex", flexDirection: "column", height: "400px" }}>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "12px",
                border: "1px solid #e8ecef",
                borderRadius: "12px",
                background: "#fff",
              }}
            >
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: msg.sender_type === "brand" ? "row-reverse" : "row",
                      alignItems: "flex-start",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "8px 12px",
                        borderRadius: "15px",
                        backgroundColor: msg.sender_type === "brand" ? "#26A69A" : "#e8ecef",
                        color: msg.sender_type === "brand" ? "#fff" : "#1f2937",
                        textAlign: msg.sender_type === "brand" ? "right" : "left",
                      }}
                    >
                      <p style={{ margin: 0, fontSize: "14px" }}>{msg.message}</p>
                      <span style={{ fontSize: "10px", color: msg.sender_type === "brand" ? "#e6f7ff" : "#4b5563" }}>
                        {moment(msg.created_at).format("MMM D, YYYY HH:mm")}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: "center", color: "#4b5563", fontSize: "14px" }}>
                  No messages yet.
                </p>
              )}
            </div>
            <div style={{ display: "flex", marginTop: "12px", gap: "8px" }}>
              <StyledTextArea
                rows={2}
                placeholder="Type your message..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                style={{ flex: 1 }}
                aria-label="Type message"
              />
              <motion.div variants={buttonVariants} whileHover="hover">
                <StyledButton
                  type="primary"
                  primary
                  onClick={handleSendReply}
                  aria-label="Send message"
                >
                  Send
                </StyledButton>
              </motion.div>
            </div>
          </div>
        </ModalContent>
      </Modal>

      <Modal
        title={
          <span style={{ fontSize: "20px", fontWeight: 600, color: "#1f2937" }}>
            Extend Subscription
          </span>
        }
        open={isSubscribeModalVisible}
        onCancel={() => setIsSubscribeModalVisible(false)}
        footer={null}
        width={500}
        bodyStyle={{ background: "#f9fafb", borderRadius: 16 }}
      >
        <ModalContent>
          <p style={{ marginBottom: 16, color: "#4b5563", fontSize: "14px" }}>
            Extend your collaboration with this creator!
          </p>
          {subscriptionPackages.map((pkg) => (
            <div key={pkg.offer_id} style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
              <div><strong>{pkg.package_name}</strong></div>
              <div>{require('../utils/currency').formatPrice(parseFloat(pkg.price))}/month</div>
              <div style={{ color: "#4b5563", fontSize: "12px" }}>{pkg.description}</div>
              <Space style={{ marginTop: 8 }}>
                <Select
                  placeholder="Duration"
                  style={{ width: 120 }}
                  onChange={(duration) => handleSubscribe(pkg.offer_id, duration, "stripe")}
                >
                  <Option value={3}>3 Months</Option>
                  <Option value={6}>6 Months</Option>
                  <Option value={12}>12 Months</Option>
                </Select>
                <motion.div variants={buttonVariants} whileHover="hover">
                  <StyledButton onClick={() => handleSubscribe(pkg.offer_id, 1, "paypal")}>
                    PayPal (1 Month)
                  </StyledButton>
                </motion.div>
              </Space>
            </div>
          ))}
        </ModalContent>
      </Modal>

      <Modal
        title={
          <span style={{ fontSize: "20px", fontWeight: 600, color: "#1f2937" }}>
            Review Content
          </span>
        }
        open={isReviewModalVisible}
        onCancel={() => setIsReviewModalVisible(false)}
        footer={null}
        width={600}
        bodyStyle={{ background: "#f9fafb", borderRadius: 16 }}
      >
        <ModalContent>
          {selectedBooking && (selectedBooking.type === "Sponsor" || selectedBooking.type === "One-off Partnership") ? (
            <div>
              <CreatorWrapper>
                <Avatar
                  src={selectedBooking.creator_profile || "https://via.placeholder.com/40"}
                  size={40}
                  style={{ border: "2px solid #e8ecef" }}
                />
                <CreatorName>
                  <strong>Creator:</strong> {selectedBooking.creator}
                </CreatorName>
              </CreatorWrapper>
              {selectedBooking.content_link && (
                <p><strong>Content:</strong> <a href={selectedBooking.content_link} target="_blank" rel="noopener noreferrer" style={{ color: "#26A69A" }}>{selectedBooking.content_link}</a></p>
              )}
              {selectedBooking.file_url && (
                <p><strong>File:</strong> <a href={selectedBooking.file_url} target="_blank" rel="noopener noreferrer" style={{ color: "#26A69A" }}>View File</a></p>
              )}
              {selectedBooking.submission_notes && <p><strong>Notes:</strong> {selectedBooking.submission_notes}</p>}
              <Form form={reviewForm} onFinish={handleReviewContent} layout="vertical">
                <Form.Item name="action" label="Action" rules={[{ required: true, message: "Please select an action" }]}>
                  <Select placeholder="Select an action">
                    <Option value="approve">Approve</Option>
                    <Option value="revision">Request Revision</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="revision_notes"
                  label="Feedback (Required for Revision)"
                  dependencies={["action"]}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (getFieldValue("action") === "revision" && !value) {
                          return Promise.reject(new Error("Please provide feedback"));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <StyledTextArea rows={3} placeholder="e.g., Adjust the caption" />
                </Form.Item>
                <motion.div variants={buttonVariants} whileHover="hover">
                  <StyledButton type="primary" primary htmlType="submit">
                    Submit Review
                  </StyledButton>
                </motion.div>
              </Form>
            </div>
          ) : (
            <p>Review is only available for Sponsor or One-off Partnership bookings.</p>
          )}
        </ModalContent>
      </Modal>

      <Modal
        title={
          <span style={{ fontSize: "20px", fontWeight: 600, color: "#1f2937" }}>
            Complete Payment
          </span>
        }
        open={isPaymentModalVisible}
        onCancel={() => {
          setIsPaymentModalVisible(false);
          setClientSecret(null);
          setSelectedBooking(null);
        }}
        footer={null}
        bodyStyle={{ background: "#f9fafb", borderRadius: 16 }}
      >
        <ModalContent>
          {clientSecret && selectedBooking ? (
            <Elements stripe={stripePromise}>
              <PaymentForm 
                clientSecret={clientSecret} 
                booking={selectedBooking} 
                onSuccess={handlePaymentSuccess}
                onCancel={() => {
                  setIsPaymentModalVisible(false);
                  setClientSecret(null);
                  setSelectedBooking(null);
                }}
                isSubscription={selectedBooking.type === "Subscription"}
              />
            </Elements>
          ) : (
            <p>Loading payment details...</p>
          )}
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default BrandBookings;