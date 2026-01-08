import React, { useState, useEffect, useCallback } from "react";
import {
  Input,
  Button,
  Modal,
  Tag,
  Spin,
  message,
  Tooltip,
  Alert,
  Card,
  Row,
  Col,
  Upload,
  Table,
  Steps,
  Avatar,
  Badge,
  Checkbox,
  Progress,
  Statistic,
  Space,
  // eslint-disable-next-line no-unused-vars
  Collapse,
  // eslint-disable-next-line no-unused-vars
  Popconfirm,
  // eslint-disable-next-line no-unused-vars
  Form,
  // eslint-disable-next-line no-unused-vars
  Select,
  // eslint-disable-next-line no-unused-vars
  Switch,
  // eslint-disable-next-line no-unused-vars
  DatePicker,
} from "antd";
// eslint-disable-next-line no-unused-vars
import { SearchOutlined, DeleteOutlined, DownOutlined, UpOutlined, EditOutlined, UploadOutlined } from "@ant-design/icons";
import {
  FaComment,
  FaEye,
  FaUpload,
  FaUser,
  FaDollarSign,
  FaClock,
  FaCheckCircle,
  // eslint-disable-next-line no-unused-vars
  FaInstagram,
  // eslint-disable-next-line no-unused-vars
  FaYoutube,
  // eslint-disable-next-line no-unused-vars
  FaTwitter,
  // eslint-disable-next-line no-unused-vars
  FaFacebook,
  // eslint-disable-next-line no-unused-vars
  FaCamera,
  // eslint-disable-next-line no-unused-vars
  FaVideo,
  // eslint-disable-next-line no-unused-vars
  FaMicrophone,
  // eslint-disable-next-line no-unused-vars
  FaBook,
  // eslint-disable-next-line no-unused-vars
  FaTiktok,
  // eslint-disable-next-line no-unused-vars
  FaSnapchat,
  // eslint-disable-next-line no-unused-vars
  FaLinkedin,
  // eslint-disable-next-line no-unused-vars
  FaPinterest,
  // eslint-disable-next-line no-unused-vars
  FaTwitch,
  // eslint-disable-next-line no-unused-vars
  FaBaby,
  // eslint-disable-next-line no-unused-vars
  FaGraduationCap,
  // eslint-disable-next-line no-unused-vars
  FaBriefcase,
  // eslint-disable-next-line no-unused-vars
  FaUserTie,
  // eslint-disable-next-line no-unused-vars
  FaGamepad,
  // eslint-disable-next-line no-unused-vars
  FaRunning,
  // eslint-disable-next-line no-unused-vars
  FaTshirt,
  // eslint-disable-next-line no-unused-vars
  FaLaptop,
  // eslint-disable-next-line no-unused-vars
  FaUtensils,
  // eslint-disable-next-line no-unused-vars
  FaPlane,
  // eslint-disable-next-line no-unused-vars
  FaHeartbeat,
  // eslint-disable-next-line no-unused-vars
  FaHome,
  // eslint-disable-next-line no-unused-vars
  FaDog,
  // eslint-disable-next-line no-unused-vars
  FaTools,
  // eslint-disable-next-line no-unused-vars
  FaMusic,
  // eslint-disable-next-line no-unused-vars
  FaLeaf,
  // eslint-disable-next-line no-unused-vars
  FaGem,
  // eslint-disable-next-line no-unused-vars
  FaShoppingCart,
  // eslint-disable-next-line no-unused-vars
  FaPalette,
  // eslint-disable-next-line no-unused-vars
  FaFlask,
  // eslint-disable-next-line no-unused-vars
  FaNewspaper,
  // eslint-disable-next-line no-unused-vars
  FaLaughSquint,
  // eslint-disable-next-line no-unused-vars
  FaFilm,
  // eslint-disable-next-line no-unused-vars
  FaChartLine,
  // eslint-disable-next-line no-unused-vars
  FaCar,
  // eslint-disable-next-line no-unused-vars
  FaPaw,
  // eslint-disable-next-line no-unused-vars
  FaTv,
  // eslint-disable-next-line no-unused-vars
  FaFutbol,
  // eslint-disable-next-line no-unused-vars
  FaPaintBrush,
  // eslint-disable-next-line no-unused-vars
  FaUserFriends
} from "react-icons/fa";
// eslint-disable-next-line no-unused-vars
import { GiLipstick, GiCookingPot } from "react-icons/gi";
// eslint-disable-next-line no-unused-vars
import { MdFamilyRestroom, MdSportsEsports, MdBeachAccess } from "react-icons/md";
// eslint-disable-next-line no-unused-vars
import axios from "axios";
import { apiClient } from '../config/api';
import moment from "moment";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
// eslint-disable-next-line no-unused-vars
import Joyride, { STATUS } from 'react-joyride';

const { Search } = Input;
const { Step } = Steps;

// Styled Components (unchanged)
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
  transition: transform 0.3s ease, box-shadow: 0.3s ease;
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

const Actions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
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
    font-size: 11px;
    color: #4b5563;
    white-space: normal;
    line-height: 1.2;
    text-align: center;
    margin-top: 4px;
  }
  .ant-steps-item-icon {
    background: #26A69A;
    border-color: #26A69A;
    width: 24px;
    height: 24px;
    line-height: 24px;
    font-size: 12px;
  }
  .ant-steps-item {
    flex: 1;
    min-width: 0;
    padding-right: 4px;
  }
  .ant-steps-item-content {
    max-width: 100%;
  }
  .ant-steps-item-tail {
    padding: 0 2px;
  }
  .ant-steps-item-tail::after {
    width: 100%;
  }
  .ant-steps-item-icon .ant-steps-icon {
    top: -1px;
  }
  @media (max-width: 768px) {
    .ant-steps-item-title {
      font-size: 10px;
    }
    .ant-steps-item-icon {
      width: 20px;
      height: 20px;
      line-height: 20px;
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

const DeliverableCheckbox = styled(Checkbox)`
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #4b5563;
  .ant-checkbox {
    margin-right: 8px;
  }
  .ant-checkbox-inner {
    border-radius: 4px;
    width: 16px;
    height: 16px;
    border: 2px solid #d1d5db;
  }
  .ant-checkbox-checked .ant-checkbox-inner {
    background: linear-gradient(135deg, #26A69A, #4DB6AC);
    border-color: transparent;
  }
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const BrandWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const BrandName = styled.p`
  margin: 0;
  font-size: 16px;
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

const StyledTextArea = styled(Input.TextArea)`
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
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const CardContent = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SideContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 200px;
  @media (max-width: 768px) {
    min-width: unset;
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

// Helper Functions for Styling (unchanged)
const getStatusGradient = status => {
  switch (status?.toLowerCase()) {
    case "active":
      return "linear-gradient(135deg, #22c55e, #16a34a)";
    case "pending":
    case "awaiting deliverables":
      return "linear-gradient(135deg, #f59e0b, #d97706)";
    case "completed":
      return "linear-gradient(135deg, #a855f7, #7e22ce)";
    case "hold":
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

const CreatorBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatorId, setCreatorId] = useState(null);
  const [filters, setFilters] = useState({ search: "" });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isMessageModalVisible, setIsMessageModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isSubmitModalVisible, setIsSubmitModalVisible] = useState(false);
  const [isConfirmLinkModalVisible, setIsConfirmLinkModalVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [submissionContent, setSubmissionContent] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [submissionFile, setSubmissionFile] = useState(null);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeCampaigns: 0,
    pendingActions: 0,
  });
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  const fetchCreatorId = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching creator profile from:', `${API_URL}/profile`);
      const response = await axios.get(`${API_URL}/profile`, {
        withCredentials: true,
      });
      console.log('🔍 Profile response:', {
        status: response.status,
        data: response.data,
        headers: response.headers,
      });
      const data = response.data;
      const user_role = data.user_role || data.role;
      const user_id = data.user_id || data.id;
      let creator_id = data.creator_id;
  
      console.log('🔍 Extracted profile data:', { user_role, user_id, creator_id });
  
      // Fetch creator_id if not in profile response
      if (!creator_id && user_id) {
        try {
          console.log('🔍 Fetching creator_id from:', `${API_URL}/creators?user_id=${user_id}`);
          const creatorResponse = await axios.get(`${API_URL}/creators?user_id=${user_id}`, {
            withCredentials: true,
          });
          console.log('🔍 Creator response:', {
            status: creatorResponse.status,
            data: creatorResponse.data,
          });
          // Handle array or single object response
          const creatorData = Array.isArray(creatorResponse.data)
            ? creatorResponse.data.find(creator => creator.user_id === user_id)
            : creatorResponse.data;
          creator_id = creatorData?.id;
          if (!creator_id) {
            console.warn('🔥 Creator response missing id:', creatorResponse.data);
            throw new Error('No creator ID found in response');
          }
          console.log('🔍 Creator data:', { creator_id });
        } catch (creatorError) {
          console.error('🔥 Error fetching creator_id:', {
            message: creatorError.message,
            response: creatorError.response?.data,
            status: creatorError.response?.status,
          });
          message.error('Creator profile not found. Please complete your creator profile or contact support.');
          navigate('/login', { replace: true });
          return;
        }
      }
  
      if (user_role === 'creator' && user_id && creator_id) {
        setCreatorId(creator_id);
        await fetchBookings(creator_id);
      } else {
        console.error('🔥 Invalid profile data:', {
          user_role,
          user_id,
          creator_id,
          fullData: data,
        });
        message.error('Please log in as a creator to view bookings.');
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('🔥 Error fetching creator profile:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      message.error('Failed to authenticate. Please log in again.');
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('🔍 Fetching stats from backend...');
      const statsResponse = await apiClient.get('/creators/me/stats');
      console.log('🔍 Stats response:', statsResponse.data);
      
      // Apply platform fees (15%) to calculate net earnings
      const grossEarnings = statsResponse.data.total_earnings || 0;
      const platformFee = grossEarnings * 0.15; // 15% platform fee
      const netEarnings = grossEarnings - platformFee;
      
      setStats({
        totalEarnings: netEarnings,
        activeCampaigns: statsResponse.data.active_campaigns || 0,
        pendingActions: statsResponse.data.pending_actions || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Keep existing stats if API fails
    }
  };

  const fetchBookings = useCallback(
    async (id) => {
      try {
        console.log('🔍 Fetching bookings for creator_id:', id);
        const bookingsResponse = await axios.get(`${API_URL}/bookings?creator_id=${id}`, {
          withCredentials: true,
        });
        console.log('🔍 Bookings response:', {
          status: bookingsResponse.status,
          data: bookingsResponse.data,
          headers: bookingsResponse.headers,
        });
        const allBookings = bookingsResponse.data
          .map((booking) => {
            let platforms = [];
            if (booking.platforms) {
              try {
                platforms =
                  typeof booking.platforms === 'string'
                    ? JSON.parse(booking.platforms)
                    : booking.platforms;
              } catch (e) {
                console.warn('🔥 Failed to parse platforms:', booking.platforms, e);
                platforms = [];
              }
            } else if (booking.platform) {
              platforms = [booking.platform];
            } else if (booking.offer_platform) {
              platforms = [booking.offer_platform];
            }
  
            const bookingType =
              booking.type || (booking.offer_id ? 'One-off Partnership' : 'Sponsor');
  
            const cost =
              bookingType === 'Subscription'
                ? `${require('../utils/currency').formatPrice(booking.total_cost / (booking.duration_months || 1))}/month`
                : bookingType === 'One-off Partnership' && booking.price
                ? require('../utils/currency').formatPrice(booking.price)
                : booking.bid_amount
                ? require('../utils/currency').formatPrice(booking.bid_amount)
                : 'Awaiting Bid';
  
            const deliverables =
              bookingType === 'Subscription' && Array.isArray(booking.deliverables)
                ? booking.deliverables.map((d, i) => ({
                    ...d,
                    index: i,
                    status: d.status || 'Pending',
                  }))
                : [];
  
            const bidAmount = booking.bid_amount != null ? parseFloat(booking.bid_amount) : null;
            const platformFeeRaw = booking.platform_fee != null ? parseFloat(booking.platform_fee) : 0;
            const platformFee =
              bidAmount && (platformFeeRaw === 0 || isNaN(platformFeeRaw))
                ? bidAmount * 0.15
                : platformFeeRaw;
            const netEarnings =
              bidAmount && !isNaN(bidAmount) ? (bidAmount - platformFee).toFixed(2) : '0.00';
  
            const mappedBooking = {
              id: booking.id,
              type: bookingType,
              key: `${bookingType.toLowerCase().replace(' ', '-')}-${booking.id}`,
              name:
                bookingType === 'Subscription'
                  ? booking.package_name
                  : booking.product_name || `Booking #${booking.id}`,
              cost: cost,
              end_date: booking.end_date || booking.promotion_date,
              start_date: booking.start_date || booking.created_at,
              status: booking.content_status || booking.status || 'Pending',
              brand: booking.brand_name || 'Unknown Brand',
              brand_id: booking.brand_id || null,
              unread_count: booking.unread_count || 0,
              updated_at: booking.updated_at || booking.created_at || booking.start_date,
              deliverables: deliverables,
              content_link: booking.content_link || null,
              file_url: booking.content_file_url || null,
              submission_notes: booking.submission_notes || '',
              revision_notes: booking.revision_notes || '',
              payment_status: booking.payment_status || 'On Hold',
              platforms: platforms,
              description: booking.brief || booking.description || 'No brief provided',
              brand_logo: booking.brand_logo || null,
              offer_name: booking.offer_name || 'N/A',
              bid_amount: bidAmount,
              price: booking.price != null ? parseFloat(booking.price) : null,
              total_cost: booking.total_cost != null ? parseFloat(booking.total_cost) : null,
              duration_months: booking.duration_months || 1,
              platform_fee: platformFee,
              net_earnings: netEarnings,
            };
  
            console.debug(
              `Mapped booking ID: ${mappedBooking.id}, Type: ${mappedBooking.type}, Payment Status: ${mappedBooking.payment_status}, Bid Amount: ${mappedBooking.bid_amount}, Price: ${mappedBooking.price}, Total Cost: ${mappedBooking.total_cost}, Platform Fee: ${mappedBooking.platform_fee}, Net Earnings: ${mappedBooking.net_earnings}`
            );
            return mappedBooking;
          })
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        setBookings(allBookings);
        
        // Also fetch stats from backend
        await fetchStats();
      } catch (error) {
        console.error('🔥 Error fetching bookings:', {
          message: error.message,
          response: error.response?.data || error.response?.statusText,
          status: error.response?.status,
          headers: error.response?.headers,
          creator_id: id,
          request_url: `${API_URL}/bookings?creator_id=${id}`,
          response_body: error.response?.data || error.response?.statusText,
        });
        if (error.response?.status === 500) {
          message.error('Server error while loading bookings. Please try again later or contact support.');
        } else if (error.response?.status === 401) {
          message.error('Session expired. Please log in again.');
          navigate('/login', { replace: true });
        } else if (error.response?.status === 404) {
          message.info('No bookings found for your account.');
          setBookings([]);
        } else {
          message.error('Failed to load bookings. Please try again.');
        }
      }
    },
    [API_URL, navigate]
  );

  useEffect(() => {
    fetchCreatorId();
    const intervalId = setInterval(() => {
      if (creatorId) fetchBookings(creatorId);
    }, 5000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorId, fetchBookings]);

  const fetchBookingDetails = async (bookingId, bookingType) => {
    try {
      console.log('🔍 Fetching booking details:', { bookingId, bookingType });
      if (bookingType === "Subscription") {
        const response = await axios.get(
          `${API_URL}/subscriptions/${bookingId}/deliverables`,
          { withCredentials: true }
        );
        const deliverables = response.data.map((d, i) => ({
          index: d.index,
          type: d.type,
          platform: d.platform,
          quantity: d.quantity,
          submitted: d.submitted,
          remaining: d.remaining,
          status: d.status || "Pending",
          submissions: d.submissions || [],
        }));
        console.log("Fetched deliverables for subscription:", deliverables);
        const booking = bookings.find(
          b => b.id === bookingId && b.type === "Subscription"
        );
        return { ...booking, deliverables };
      } else {
        const response = await axios.get(
          `${API_URL}/bookings/${bookingId}`,
          { withCredentials: true }
        );
        const booking = response.data;

        console.log("Raw booking details response:", booking);

        const deliverables = [{
          index: 0,
          type: "Content",
          platform: booking.platform || booking.offer_platform || "Not specified",
          quantity: 1,
          submitted: booking.content_link || booking.content_file_url ? 1 : 0,
          remaining: booking.content_link || booking.content_file_url ? 0 : 1,
          status: booking.content_status || booking.status || "Pending",
          submissions: [{
            content_link: booking.content_link,
            file_url: booking.content_file_url,
            submission_notes: booking.submission_notes,
            created_at: booking.updated_at || booking.created_at
          }].filter(s => s.content_link || s.file_url)
        }];

        let platforms = [];
        if (booking.platforms) {
          try {
            platforms =
              typeof booking.platforms === "string"
                ? JSON.parse(booking.platforms)
                : booking.platforms;
          } catch (e) {
            platforms = [];
          }
        } else if (booking.platform) {
          platforms = [booking.platform];
        } else if (booking.offer_platform) {
          platforms = [booking.offer_platform];
        }

        const bidAmount = booking.bid_amount != null ? parseFloat(booking.bid_amount) : null;
        const platformFeeRaw = booking.platform_fee != null ? parseFloat(booking.platform_fee) : 0;
        const platformFee = bidAmount && (platformFeeRaw === 0 || isNaN(platformFeeRaw))
          ? bidAmount * 0.15
          : platformFeeRaw;
        const netEarnings = bidAmount && !isNaN(bidAmount)
          ? (bidAmount - platformFee).toFixed(2)
          : "0.00";

        console.log(`Computed for booking ${bookingId}: Bid Amount: ${bidAmount}, Platform Fee: ${platformFee}, Net Earnings: ${netEarnings}`);

        const detailedBooking = {
          id: booking.id,
          type: booking.type || "Sponsor",
          name: booking.product_name || `Booking #${booking.id}`,
          cost: bidAmount != null
            ? require('../utils/currency').formatPrice(bidAmount)
            : "Awaiting Bid",
          start_date: booking.created_at,
          end_date: booking.promotion_date,
          status: booking.content_status || booking.status || "Pending",
          unread_count: booking.unread_count || 0,
          content_link: booking.content_link || null,
          file_url: booking.content_file_url || null,
          submission_notes: booking.submission_notes || "",
          revision_notes: booking.revision_notes || "",
          payment_status: booking.payment_status || "On Hold",
          platforms: platforms,
          description: booking.brief || booking.description || "No brief provided",
          brand: booking.brand_name || "Unknown Brand",
          brand_id: booking.brand_id || null,
          brand_logo: booking.brand_logo || null,
          offer_name: booking.offer_name || "N/A",
          bid_amount: bidAmount,
          platform_fee: platformFee,
          net_earnings: netEarnings,
          updated_at: booking.updated_at || booking.created_at,
          deliverables: deliverables
        };

        console.log("Mapped detailed booking:", detailedBooking);
        return detailedBooking;
      }
    } catch (error) {
      console.error("🔥 Error fetching details:", error.response?.data || error.message);
      message.error("Failed to fetch booking details.");
      return bookings.find(b => b.id === bookingId && b.type === bookingType) || null;
    }
  };

  const showDetailsModal = async booking => {
    console.log("Opening details modal for booking:", booking);
    setLoading(true);
    try {
      const detailedBooking = await fetchBookingDetails(booking.id, booking.type);
      console.log("Fetched detailed booking for modal:", detailedBooking);
      setSelectedBooking(detailedBooking || booking);
      setIsDetailsModalVisible(true);
    } catch (error) {
      console.error("Error fetching details:", error);
      setSelectedBooking(booking);
      setIsDetailsModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const showReplyModal = async booking => {
    setSelectedBooking(booking);
    setIsMessageModalVisible(true);
    try {
      const endpoint =
        booking.type === "Subscription"
          ? `${API_URL}/messages/subscription/${booking.id}`
          : `${API_URL}/messages/booking/${booking.id}`;
      console.log('🔍 Fetching messages from:', endpoint);
      const response = await axios.get(endpoint, { withCredentials: true });
      console.log('🔍 Messages response:', response.data);
      setMessages(response.data || []);
      fetchBookings(creatorId);
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
      console.log('🔍 Sending message to:', endpoint);
      await axios.post(
        endpoint,
        { message: currentMessage, sender_type: "creator" },
        { withCredentials: true }
      );
      setMessages([
        ...messages,
        { sender_type: "creator", message: currentMessage, created_at: new Date() },
      ]);
      setCurrentMessage("");
      message.success("Message sent successfully!");
      fetchBookings(creatorId);
    } catch (error) {
      console.error("🔥 Error sending reply:", error.response?.data || error.message);
      message.error("Failed to send message. Please try again.");
    }
  };

  const showSubmitModal = async booking => {
    setSelectedBooking(booking);
    setSubmissionContent(booking.content_link || "");
    setSubmissionNotes(booking.submission_notes || "");
    setSubmissionFile(null);
    
    // Decide which modal to show based on status
    if (booking.status === "Approved" && ["Sponsor", "One-off Partnership"].includes(booking.type)) {
      setIsConfirmLinkModalVisible(true); // Show final link modal for Approved status
    } else {
      setIsSubmitModalVisible(true); // Show draft modal for other statuses
      if (booking.type === "Subscription") {
        const detailedBooking = await fetchBookingDetails(booking.id, booking.type);
        setSelectedBooking(detailedBooking || booking);
      }
    }
  };

  const handleSubmitContent = async (isFinalLink = false) => {
    if (!submissionContent?.trim() && !submissionFile) {
      message.warning("Please provide a content link before submitting.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    if (submissionContent?.trim()) formData.append("content_link", submissionContent.trim());
    if (submissionFile) formData.append("file", submissionFile);
    formData.append("submission_notes", submissionNotes || "");
    if (
      selectedBooking.type === "Subscription" &&
      selectedBooking.deliverables.length > 0
    ) {
      const selectedIndices = selectedBooking.deliverables
        .filter(
          d => d.remaining > 0 && document.getElementById(`deliverable-${d.index}`)?.checked
        )
        .map(d => d.index);
      if (selectedIndices.length === 0) {
        message.warning("Please select at least one deliverable with remaining submissions.");
        setLoading(false);
        return;
      }
      formData.append("deliverable_ids", JSON.stringify(selectedIndices));
    } else if (["Sponsor", "One-off Partnership"].includes(selectedBooking.type)) {
      if (
        !["Confirmed", "Revision Requested", "Approved"].includes(
          selectedBooking.status
        )
      ) {
        message.warning(`Cannot submit content for status: ${selectedBooking.status}`);
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint =
        selectedBooking.type === "Subscription"
          ? `${API_URL}/submit-content/subscription/${selectedBooking.id}`
          : `${API_URL}/submit-content/${selectedBooking.id}`;
      console.log('🔍 Submitting content to:', endpoint);
      const response = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      console.log('🔍 Content submission response:', response.data);
      message.success(
        isFinalLink
          ? "Your content was sent successfully! Awaiting brand approval."
          : response.data.message || "Content submitted! Awaiting brand review."
      );
      setIsSubmitModalVisible(false);
      setIsConfirmLinkModalVisible(false);
      setSubmissionContent("");
      setSubmissionNotes("");
      setSubmissionFile(null);
      await fetchBookings(creatorId);
      const updatedBooking = await fetchBookingDetails(
        selectedBooking.id,
        selectedBooking.type,
      );
      setSelectedBooking(updatedBooking || selectedBooking);
    } catch (error) {
      console.error("🔥 Error submitting content:", error.response?.data || error.message);
      message.error("Failed to submit content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredBookings = bookings.filter(booking =>
    booking.brand.toLowerCase().includes(filters.search.toLowerCase()) ||
    booking.name.toLowerCase().includes(filters.search.toLowerCase())
  );

  const sponsorSteps = [
    { title: "Bid Accepted" },
    { title: "Content Submitted" },
    { title: "Revision Requested" },
    { title: "Approved" },
    { title: "Published" },
    { title: "Completed" },
  ];

  const getCurrentStep = status => {
    switch (status) {
      case "Confirmed":
        return 0;
      case "Submitted":
      case "Draft Submitted":
        return 1;
      case "Revision Requested":
        return 2;
      case "Approved":
        return 3;
      case "Published":
        return 4;
      case "Completed":
        return 5;
      default:
        return 0;
    }
  };

  const calculateSubscriptionProgress = booking => {
    if (!booking.deliverables || !Array.isArray(booking.deliverables))
      return { delivered: 0, total: 0, percent: 0 };
    const total = booking.deliverables.reduce(
      (sum, d) => sum + (d.quantity || 0),
      0
    );
    const delivered = booking.deliverables.reduce(
      (sum, d) => sum + (d.submitted || 0),
      0
    );
    const percent = total > 0 ? Math.round((delivered / total) * 100) : 0;
    return { delivered, total, percent };
  };

  // Calculate completion rate locally since it's not provided by the backend
  const calculateCompletionRate = () => {
    const totalDeliverables = bookings.reduce(
      (sum, b) =>
        sum +
        (b.type === "Subscription"
          ? b.deliverables.reduce((dSum, d) => dSum + (d.quantity || 0), 0)
          : 1),
      0
    );
    const completedDeliverables = bookings.reduce(
      (sum, b) =>
        sum +
        (b.type === "Subscription"
          ? b.deliverables.reduce((dSum, d) => dSum + (d.submitted || 0), 0)
          : b.status === "Completed"
          ? 1
          : 0),
      0
    );
    return totalDeliverables > 0
      ? Math.round((completedDeliverables / totalDeliverables) * 100)
      : 0;
  };

  const completionRate = calculateCompletionRate();

  const renderBookingCard = booking => {
    const isSubscription = booking.type === "Subscription";
    const progress = isSubscription ? calculateSubscriptionProgress(booking) : null;
    const isCompleted = booking.payment_status === "Completed" || booking.status === "Completed";

    return (
      <motion.div variants={cardVariants} initial="hidden" animate="visible">
        <BookingCard>
          <CardContent>
            <MainContent>
              <BrandWrapper>
                <Avatar
                  src={booking.brand_logo || "https://via.placeholder.com/40"}
                  size={40}
                  style={{ border: "2px solid #e8ecef", flexShrink: 0 }}
                />
                <BrandName>
                  {booking.brand_id ? (
                    <Link to={`/brand/profile/${booking.brand_id}`} style={{ color: "#26A69A" }}>
                      {booking.brand}
                    </Link>
                  ) : (
                    booking.brand
                  )}
                </BrandName>
              </BrandWrapper>
              <Space size={8} wrap>
                <TypeTag gradient={getTypeGradient(booking.type)}>
                  {booking.type === "Subscription" ? <FaUser /> : <FaDollarSign />}
                  {booking.type}
                </TypeTag>
                <StatusTag gradient={getStatusGradient(booking.status)}>
                  {booking.status === "pending" ? "Awaiting Deliverables" : booking.status}
                </StatusTag>
              </Space>
              {isSubscription ? (
                <ProgressWrapper>
                  <Progress
                    percent={progress.percent}
                    size="small"
                    status={progress.percent === 100 ? "success" : "active"}
                  />
                  <span style={{ fontSize: "12px", color: "#4b5563" }}>
                    {`${progress.delivered}/${progress.total} Delivered`}
                  </span>
                </ProgressWrapper>
              ) : (
                <StepsWrapper>
                  <Steps
                    current={getCurrentStep(booking.status)}
                    size="small"
                    status={isCompleted ? "finish" : "process"}
                    labelPlacement="vertical"
                  >
                    {sponsorSteps.map(step => (
                      <Step key={step.title} title={step.title} />
                    ))}
                  </Steps>
                </StepsWrapper>
              )}
            </MainContent>
            <SideContent>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "#1f2937" }}>
                {booking.cost}
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
                {((booking.type === "Subscription" ||
                  ["Sponsor", "One-off Partnership"].includes(booking.type)) &&
                  (booking.type === "Subscription" ||
                    (["Confirmed", "Revision Requested", "Approved"].includes(
                      booking.status
                    ) &&
                      !["Published", "Completed"].includes(booking.status)))) ? (
                  <Tooltip
                    title={
                      booking.status === "Approved"
                        ? "Submit Published Link"
                        : "Submit Content"
                    }
                  >
                    <motion.div variants={buttonVariants} whileHover="hover">
                      <FaUpload
                        onClick={() => showSubmitModal(booking)}
                        style={{ cursor: "pointer", fontSize: "18px", color: "#4b5563" }}
                      />
                    </motion.div>
                  </Tooltip>
                ) : null}
              </Actions>
            </SideContent>
          </CardContent>
        </BookingCard>
      </motion.div>
    );
  };

  return (
    <Container>
      <Header>
        <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#1f2937", margin: 0 }}>
          Creator Dashboard
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
        message="Your Campaigns"
        description="Manage all your brand partnerships and collaborations here."
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
                    title="Total Earnings"
                    value={stats.totalEarnings.toFixed(2)}
                    prefix={require('../utils/currency').getCurrencySymbol()}
                    valueStyle={{ color: '#fff', fontSize: '24px', fontWeight: '700' }}
                  />
                </OverviewCard>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <motion.div variants={cardVariants} initial="hidden" animate="visible">
                <OverviewCard>
                  <Statistic
                    title="Active Campaigns"
                    value={stats.activeCampaigns}
                    prefix={<FaUser />}
                  />
                </OverviewCard>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <motion.div variants={cardVariants} initial="hidden" animate="visible">
                <OverviewCard>
                  <Statistic
                    title="Pending Actions"
                    value={stats.pendingActions}
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
                    value={completionRate}
                    suffix="%"
                    prefix={<FaCheckCircle />}
                  />
                </OverviewCard>
              </motion.div>
            </Col>
          </Row>
          <FilterBar>
            <Search
              placeholder="Search by brand or name"
              onSearch={value => handleFilterChange("search", value)}
              style={{ width: 300 }}
              aria-label="Search bookings"
            />
          </FilterBar>
          {filteredBookings.length > 0 ? (
            filteredBookings.map(renderBookingCard)
          ) : (
            <p style={{ textAlign: "center", color: "#4b5563", fontSize: "16px" }}>
              No active bookings yet.
            </p>
          )}
        </>
      )}

      <Modal
        title={
          <span style={{ fontSize: "20px", fontWeight: 600, color: "#1f2937" }}>
            {selectedBooking ? `Details: ${selectedBooking.brand}` : "Booking Details"}
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
              {selectedBooking.type === "Subscription" ? (
                <>
                  <p>
                    <strong>Type:</strong>{" "}
                    <TypeTag gradient={getTypeGradient("Subscription")}>
                      Subscription
                    </TypeTag>
                  </p>
                  <BrandWrapper>
                    <Avatar
                      src={selectedBooking.brand_logo || "https://via.placeholder.com/40"}
                      size={40}
                      style={{ border: "2px solid #e8ecef" }}
                    />
                    <BrandName>
                      <strong>Brand:</strong>{" "}
                      {selectedBooking.brand_id ? (
                        <Link to={`/brand/profile/${selectedBooking.brand_id}`} style={{ color: "#26A69A" }}>
                          {selectedBooking.brand}
                        </Link>
                      ) : (
                        selectedBooking.brand
                      )}
                    </BrandName>
                  </BrandWrapper>
                  <p><strong>Package:</strong> {selectedBooking.name || "N/A"}</p>
                  <p><strong>Revenue:</strong> {selectedBooking.cost || "N/A"}</p>
                  {selectedBooking.total_cost != null && !isNaN(parseFloat(selectedBooking.total_cost)) && (
                    <>
                      <p>
                        <strong>Platform Fee (15%):</strong>{" "}
                        {require('../utils/currency').formatPrice(selectedBooking.platform_fee != null && !isNaN(parseFloat(selectedBooking.platform_fee))
                          ? parseFloat(selectedBooking.platform_fee)
                          : parseFloat(selectedBooking.total_cost) * 0.15)}
                      </p>
                      <p>
                        <strong>Net Earnings:</strong>{" "}
                        {require('../utils/currency').formatPrice(selectedBooking.net_earnings && !isNaN(parseFloat(selectedBooking.net_earnings))
                          ? parseFloat(selectedBooking.net_earnings)
                          : ((parseFloat(selectedBooking.total_cost) - (parseFloat(selectedBooking.platform_fee) || parseFloat(selectedBooking.total_cost) * 0.15)) / (selectedBooking.duration_months || 1)))}
                      </p>
                    </>
                  )}
                  <p><strong>Start Date:</strong> {selectedBooking.start_date ? moment(selectedBooking.start_date).format("YYYY-MM-DD") : "N/A"}</p>
                  <p><strong>End Date:</strong> {selectedBooking.end_date ? moment(selectedBooking.end_date).format("YYYY-MM-DD") : "N/A"}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <StatusTag gradient={getStatusGradient(selectedBooking.status)}>
                      {selectedBooking.status || "Pending"}
                    </StatusTag>
                  </p>
                  {selectedBooking.deliverables && selectedBooking.deliverables.length > 0 ? (
                    <>
                      <h3 style={{ marginTop: 16, fontSize: "18px", color: "#1f2937" }}>
                        Deliverables
                      </h3>
                      <div style={{ overflowX: "auto", maxWidth: "100%" }}>
                        <Table
                          columns={deliverablesColumns}
                          dataSource={selectedBooking.deliverables}
                          pagination={false}
                          rowKey="index"
                          size="small"
                          style={{ background: "#fff", borderRadius: 12, minWidth: 500 }}
                          scroll={{ x: "max-content" }}
                        />
                      </div>
                    </>
                  ) : (
                    <p>No deliverables available.</p>
                  )}
                </>
              ) : (
                <>
                  <p>
                    <strong>Type:</strong>{" "}
                    <TypeTag gradient={getTypeGradient(selectedBooking.type)}>
                      {selectedBooking.type}
                    </TypeTag>
                  </p>
                  <BrandWrapper>
                    <Avatar
                      src={selectedBooking.brand_logo || "https://via.placeholder.com/40"}
                      size={40}
                      style={{ border: "2px solid #e8ecef" }}
                    />
                    <BrandName>
                      <strong>Brand:</strong>{" "}
                      {selectedBooking.brand_id ? (
                        <Link to={`/brand/profile/${selectedBooking.brand_id}`} style={{ color: "#26A69A" }}>
                          {selectedBooking.brand}
                        </Link>
                      ) : (
                        selectedBooking.brand
                      )}
                    </BrandName>
                  </BrandWrapper>
                  <p><strong>Title:</strong> {selectedBooking.name || "N/A"}</p>
                  <p>
                    <strong>Bid Amount:</strong>{" "}
                    {selectedBooking.bid_amount != null && !isNaN(parseFloat(selectedBooking.bid_amount))
                      ? require('../utils/currency').formatPrice(parseFloat(selectedBooking.bid_amount))
                      : "N/A"}
                  </p>
                  {selectedBooking.bid_amount != null && !isNaN(parseFloat(selectedBooking.bid_amount)) && (
                    <>
                      <p>
                        <strong>Platform Fee (15%):</strong>{" "}
                        {require('../utils/currency').formatPrice(selectedBooking.platform_fee != null && parseFloat(selectedBooking.platform_fee) > 0
                          ? parseFloat(selectedBooking.platform_fee)
                          : parseFloat(selectedBooking.bid_amount) * 0.15)}
                      </p>
                      <p>
                        <strong>Net Earnings:</strong>{" "}
                        {require('../utils/currency').formatPrice(selectedBooking.net_earnings && !isNaN(parseFloat(selectedBooking.net_earnings)) && parseFloat(selectedBooking.net_earnings) > 0
                          ? parseFloat(selectedBooking.net_earnings)
                          : (parseFloat(selectedBooking.bid_amount) - (parseFloat(selectedBooking.platform_fee) || parseFloat(selectedBooking.bid_amount) * 0.15)))}
                      </p>
                    </>
                  )}
                  <p><strong>Due Date:</strong> {selectedBooking.end_date ? moment(selectedBooking.end_date).format("YYYY-MM-DD") : "N/A"}</p>
                  <p>
                    <strong>Platforms:</strong>{" "}
                    {Array.isArray(selectedBooking.platforms) && selectedBooking.platforms.length > 0
                      ? selectedBooking.platforms.join(", ")
                      : "Not specified"}
                  </p>
                  <p><strong>Description:</strong> {selectedBooking.description || "N/A"}</p>
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
                      current={getCurrentStep(selectedBooking.status)}
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
                      dataSource={selectedBooking.deliverables || []}
                      pagination={false}
                      rowKey={(record, index) => index}
                      size="small"
                      style={{ background: "#fff", borderRadius: 12, minWidth: 500 }}
                      scroll={{ x: "max-content" }}
                    />
                  </div>
                </>
              )}
            </div>
          ) : (
            <p>Loading details...</p>
          )}
        </ModalContent>
      </Modal>

      <Modal
        title={
          <span style={{ fontSize: "20px", fontWeight: 600, color: "#1f2937" }}>
            {selectedBooking ? `Chat with ${selectedBooking.brand}` : "Chat"}
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
                      flexDirection:
                        msg.sender_type === "creator" ? "row-reverse" : "row",
                      alignItems: "flex-start",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "8px 12px",
                        borderRadius: "15px",
                        backgroundColor:
                          msg.sender_type === "creator" ? "#26A69A" : "#e8ecef",
                        color: msg.sender_type === "creator" ? "#fff" : "#1f2937",
                        textAlign: msg.sender_type === "creator" ? "right" : "left",
                      }}
                    >
                      <p style={{ margin: 0, fontSize: "14px" }}>{msg.message}</p>
                      <span style={{ fontSize: "10px", color: msg.sender_type === "creator" ? "#e6f7ff" : "#4b5563" }}>
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
                onChange={e => setCurrentMessage(e.target.value)}
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
            {selectedBooking
              ? `Share content draft for ${selectedBooking.name}`
              : "Submit Content"}
          </span>
        }
        open={isSubmitModalVisible}
        onCancel={() => setIsSubmitModalVisible(false)}
        footer={[
          <StyledButton
            key="cancel"
            onClick={() => setIsSubmitModalVisible(false)}
            aria-label="Cancel submission"
          >
            Cancel
          </StyledButton>,
          <StyledButton
            key="submit"
            type="primary"
            primary
            onClick={handleSubmitContent}
            loading={loading}
            aria-label="Submit content"
          >
            Share draft
          </StyledButton>,
        ]}
        width={selectedBooking?.type === "Subscription" ? 600 : 500}
        bodyStyle={{ background: "#f9fafb", borderRadius: 16 }}
      >
        <ModalContent>
          {selectedBooking?.type === "Subscription" ? (
            <>
              <p style={{ marginBottom: 16, color: "#4b5563", fontSize: "14px" }}>
                Submit content for one unit of a deliverable (select one):
              </p>
              {selectedBooking.deliverables.length > 0 ? (
                selectedBooking.deliverables.map(deliverable => (
                  <DeliverableCheckbox
                    key={deliverable.index}
                    id={`deliverable-${deliverable.index}`}
                    disabled={deliverable.remaining === 0}
                  >
                    {`${deliverable.type} (${deliverable.platform}) - Submitted: ${deliverable.submitted}/${deliverable.quantity} - Status: ${deliverable.status}`}
                  </DeliverableCheckbox>
                ))
              ) : (
                <p style={{ color: "#4b5563", fontSize: "14px" }}>
                  No deliverables available.
                </p>
              )}
              <StyledInput
                placeholder="Content link"
                value={submissionContent}
                onChange={e => setSubmissionContent(e.target.value)}
                style={{ marginBottom: 12, marginTop: 16 }}
                aria-label="Content link"
              />
              <Upload
                beforeUpload={file => {
                  setSubmissionFile(file);
                  return false;
                }}
                onRemove={() => setSubmissionFile(null)}
                fileList={
                  submissionFile
                    ? [{ uid: "-1", name: submissionFile.name, status: "done" }]
                    : []
                }
              >
                <motion.div variants={buttonVariants} whileHover="hover">
                  <StyledButton icon={<FaUpload />}>Upload File (optional)</StyledButton>
                </motion.div>
              </Upload>
              <StyledTextArea
                placeholder="Leave any comments for the Brand (optional)"
                value={submissionNotes}
                onChange={e => setSubmissionNotes(e.target.value)}
                rows={3}
                style={{ marginTop: 12 }}
                aria-label="Content notes"
              />
            </>
          ) : (
            <>
              <p style={{ marginBottom: 16, color: "#4b5563", fontSize: "14px" }}>
                {selectedBooking?.status === "Approved"
                  ? "Confirm the link to the content:"
                  : "Share the content draft for the brand to review:"}
              </p>
              <StyledInput
                placeholder={
                  selectedBooking?.status === "Approved"
                    ? "Final post link"
                    : "Share link to the content draft"
                }
                value={submissionContent}
                onChange={e => setSubmissionContent(e.target.value)}
                style={{ marginBottom: 12 }}
                aria-label="Content link"
              />
              {selectedBooking?.status !== "Approved" && (
                <Upload
                  beforeUpload={file => {
                    setSubmissionFile(file);
                    return false;
                  }}
                  onRemove={() => setSubmissionFile(null)}
                  fileList={
                    submissionFile
                      ? [{ uid: "-1", name: submissionFile.name, status: "done" }]
                      : []
                  }
                >
                  <motion.div variants={buttonVariants} whileHover="hover">
                    <StyledButton icon={<FaUpload />}>
                      Upload File (optional)
                    </StyledButton>
                  </motion.div>
                </Upload>
              )}
              <StyledTextArea
                placeholder="Notes about the content (optional)"
                value={submissionNotes}
                onChange={e => setSubmissionNotes(e.target.value)}
                rows={3}
                style={{ marginTop: 12 }}
                aria-label="Content notes"
              />
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        title={
          <span style={{ fontSize: "20px", fontWeight: 600, color: "#1f2937" }}>
            {selectedBooking
              ? `Confirm published link for ${selectedBooking.name}`
              : "Confirm Published Link"}
          </span>
        }
        open={isConfirmLinkModalVisible}
        onCancel={() => setIsConfirmLinkModalVisible(false)}
        footer={[
          <StyledButton
            key="cancel"
            onClick={() => setIsConfirmLinkModalVisible(false)}
            aria-label="Cancel confirmation"
          >
            Cancel
          </StyledButton>,
          <StyledButton
            key="submit"
            type="primary"
            primary
            onClick={() => handleSubmitContent(true)}
            loading={loading}
            aria-label="Confirm published link"
          >
            Content Published
          </StyledButton>,
        ]}
        width={500}
        bodyStyle={{ background: "#f9fafb", borderRadius: 16 }}
      >
        <ModalContent>
          <p style={{ marginBottom: 16, color: "#4b5563", fontSize: "14px" }}>
            Paste the final link to the published post:
          </p>
          <StyledInput
            placeholder="Post link"
            value={submissionContent}
            onChange={e => setSubmissionContent(e.target.value)}
            style={{ marginBottom: 12 }}
            aria-label="Final post link"
          />
          <StyledTextArea
            placeholder="Notes about the published post (optional)"
            value={submissionNotes}
            onChange={e => setSubmissionNotes(e.target.value)}
            rows={3}
            style={{ marginTop: 12 }}
            aria-label="Content notes"
          />
        </ModalContent>
      </Modal>
    </Container>
  );
};

const deliverablesColumns = [
  { title: "Type", dataIndex: "type", key: "type" },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: status => (
      <StatusTag gradient={getStatusGradient(status)}>
        {status || "Pending"}
      </StatusTag>
    ),
  },
  {
    title: "Submissions",
    dataIndex: "submissions",
    key: "submissions",
    render: submissions => (
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

export default CreatorBookings;