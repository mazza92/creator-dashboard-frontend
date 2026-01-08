import React, { useState, useEffect } from "react";
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
  Collapse,
  Popconfirm,
  Form,
  Select,
  Switch,
  DatePicker,
} from "antd";
import { SearchOutlined, DeleteOutlined, DownOutlined, UpOutlined, EditOutlined, UploadOutlined } from "@ant-design/icons";
import {
  FaComment,
  FaEye,
  FaUpload,
  FaUser,
  FaDollarSign,
  FaClock,
  FaCheckCircle,
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaFacebook,
  FaCamera,
  FaVideo,
  FaMicrophone,
  FaBook,
  FaTiktok,
  FaSnapchat,
  FaLinkedin,
  FaPinterest,
  FaTwitch,
  FaBaby,
  FaGraduationCap,
  FaBriefcase,
  FaUserTie,
  FaGamepad,
  FaRunning,
  FaTshirt,
  FaLaptop,
  FaUtensils,
  FaPlane,
  FaHeartbeat,
  FaHome,
  FaDog,
  FaTools,
  FaMusic,
  FaLeaf,
  FaGem,
  FaShoppingCart,
  FaPalette,
  FaFlask,
  FaNewspaper,
  FaLaughSquint,
  FaFilm,
  FaChartLine,
  FaCar,
  FaPaw,
  FaTv,
  FaFutbol,
  FaPaintBrush,
  FaUserFriends
} from "react-icons/fa";
import { GiLipstick, GiCookingPot } from "react-icons/gi";
import { MdFamilyRestroom, MdSportsEsports, MdBeachAccess } from "react-icons/md";
import axios from "axios";
import moment from "moment";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const { Search } = Input;
const { Step } = Steps;

// Styled Components
const Container = styled.div`
  padding: 40px;
  background: #f9fafb;
  min-height: 100vh;
  font-family: "Inter", sans-serif;
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

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

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
    }
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
          <Row gutter={[16, 16]} style={{ marginBottom: 32 }} className="stats-overview">
            {/* ... existing code ... */}

            <Actions className="booking-actions">
              <Tooltip title="Chat with brand about this booking" placement="top">
                <Badge count={booking.unread_count || 0}>
                  <motion.div variants={buttonVariants} whileHover="hover">
                    <FaComment
                      onClick={() => showReplyModal(booking)}
                      style={{ cursor: "pointer", fontSize: "18px", color: "#4b5563" }}
                      className="message-action"
                    />
                  </motion.div>
                </Badge>
              </Tooltip>
              <Tooltip title="View booking details and progress" placement="top">
                <motion.div variants={buttonVariants} whileHover="hover">
                  <FaEye
                    onClick={() => showDetailsModal(booking)}
                    style={{ cursor: "pointer", fontSize: "18px", color: "#4b5563" }}
                    className="details-action"
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
                      ? "Submit the final published link"
                      : "Submit content for brand review"
                  }
                  placement="top"
                >
                  <motion.div variants={buttonVariants} whileHover="hover">
                    <FaUpload
                      onClick={() => showSubmitModal(booking)}
                      style={{ cursor: "pointer", fontSize: "18px", color: "#4b5563" }}
                      className="submit-action"
                    />
                  </motion.div>
                </Tooltip>
              ) : null}
            </Actions>
            {/* ... existing code ... */}
          </Row>
        </>
      )}
    </Container>
  );
};

export default CreatorBookings; 