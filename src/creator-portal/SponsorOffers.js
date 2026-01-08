import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card, Button, Row, Col, message, Spin, Typography, Tag, Tooltip, Collapse, Popconfirm, Space, Modal, Form, Input, Select, Switch, Upload, DatePicker, Avatar,
} from "antd";
import CurrencySelector from '../components/CurrencySelector';
import { FiImage, FiCamera, FiVideo, FiFilm } from "react-icons/fi";
import { MdOutlineLiveTv, MdOutlineAudiotrack } from "react-icons/md";
import {
  FaInstagram, FaYoutube, FaTwitter, FaFacebook, FaCamera, FaVideo, /* eslint-disable-line no-unused-vars */ FaMicrophone, FaBook, FaTiktok, FaSnapchat, FaLinkedin, FaPinterest, FaTwitch,
  FaBaby, FaGraduationCap, FaBriefcase, FaUserTie, FaGamepad, 
  FaRunning, FaTshirt, FaLaptop, FaUtensils, FaPlane, 
  FaHeartbeat, FaHome, FaDog, FaTools, FaMusic, 
  FaLeaf, FaGem, FaShoppingCart, FaPalette, 
  FaFlask, FaNewspaper, FaLaughSquint, FaFilm, FaChartLine,
  FaCar, FaPaw, FaTv, FaFutbol, FaPaintBrush, FaUserFriends
} from 'react-icons/fa';
// eslint-disable-next-line no-unused-vars
import { GiLipstick, GiCookingPot } from 'react-icons/gi';
// eslint-disable-next-line no-unused-vars
import { MdFamilyRestroom, MdSportsEsports, MdBeachAccess } from 'react-icons/md';
import { DeleteOutlined, DownOutlined, UpOutlined, EditOutlined, UploadOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import styled from "styled-components";
import moment from "moment";
import { motion } from 'framer-motion';
// eslint-disable-next-line no-unused-vars
import { QuestionCircleOutlined } from '@ant-design/icons';
import api from '../config/api';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;

const Container = styled.div`
  padding: 32px 20px 20px 20px;
  background: #f9fafb;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  @media (max-width: 575px) {
    padding: 16px 4px 8px 4px;
  }
`;

const DraftCard = styled(Card)`
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(16,185,129,0.08);
  margin-bottom: 32px;
  border: none;
  transition: all 0.3s ease;
  background: #fff;
  overflow: hidden;
  width: 100%;
  padding: 0;
  @media (max-width: 575px) {
    margin-bottom: 20px;
    border-radius: 16px;
  }
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(16,185,129,0.12);
  }
  .ant-card-head {
    border-bottom: 1px solid #e5e7eb;
    padding: 20px 24px 16px 24px;
    background: #f8fafc;
    @media (max-width: 575px) {
      padding: 14px 10px 10px 10px;
    }
  }
  .ant-card-body {
    padding: 32px 28px 24px 28px;
    @media (max-width: 575px) {
      padding: 16px 6px 12px 6px;
    }
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  @media (max-width: 575px) {
    font-size: 17px;
    margin-bottom: 14px;
    padding-bottom: 10px;
  }
`;

const CardContent = styled.div`
  padding: 24px 0 0 0;
  background: #fff;
  border-radius: 0 0 20px 20px;
  @media (max-width: 575px) {
    padding: 10px 0 0 0;
  }
`;

const CreatorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  @media (max-width: 575px) {
    gap: 12px;
    margin-bottom: 16px;
    flex-direction: column;
    align-items: flex-start;
  }
`;

const CreatorAvatar = styled(Avatar)`
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  @media (max-width: 575px) {
    width: 44px !important;
    height: 44px !important;
  }
  &:hover {
    transform: scale(1.05);
  }
`;

const CreatorName = styled(Link)`
  font-weight: 700;
  font-size: 19px;
  color: #1f2937;
  transition: color 0.2s ease;
  @media (max-width: 575px) {
    font-size: 16px;
  }
  &:hover {
    color: #26A69A;
  }
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 18px;
  margin-left: auto;
  @media (max-width: 575px) {
    gap: 10px;
    margin-left: 0;
    margin-top: 8px;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 15px;
  color: #4b5563;
  background: #f0fdfa;
  transition: all 0.2s ease;
  @media (max-width: 575px) {
    padding: 6px 10px;
    font-size: 13px;
  }
  &:hover {
    color: #26A69A;
    background: #e0f7fa;
  }
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  overflow: hidden;
  margin-bottom: 20px;
  background: #000;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media (max-width: 575px) {
    margin-bottom: 16px;
    border-radius: 8px;
  }
`;

const VideoPlaceholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
`;

const StyledVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  max-height: inherit;
  border-radius: 12px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const DescriptionText = styled(Text)`
  display: block;
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 24px;
  color: #4b5563;
  white-space: pre-wrap;
  padding: 18px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  @media (max-width: 575px) {
    font-size: 13.5px;
    padding: 12px;
    margin-bottom: 16px;
    border-radius: 8px;
  }
`;

const ReadMoreLink = styled.a`
  color: #26A69A;
  cursor: pointer;
  font-weight: 500;
  margin-left: 8px;
  transition: color 0.2s ease;
  
  &:hover {
    color: #4DB6AC;
  }
`;

const TagList = styled.div`
  margin-bottom: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  @media (max-width: 575px) {
    gap: 7px;
    margin-bottom: 12px;
  }
`;

const PlatformItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;

  @media (max-width: 575px) {
    padding: 4px 8px;
    gap: 6px;
  }

  &:hover {
    color: #26A69A;
    transform: translateY(-1px);
  }

  svg {
    width: 20px;
    height: 20px;

    @media (max-width: 575px) {
      width: 16px;
      height: 16px;
    }
  }

  span {
    font-size: 14px;
    color: #4b5563;

    @media (max-width: 575px) {
      font-size: 12px;
    }
  }
`;

const ContentBadge = styled(Tag)`
  margin: 0;
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
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const FieldLabel = styled(Text)`
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  margin-right: 8px;
  display: block;
  margin-bottom: 8px;
`;

const BidItem = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
  background: #f9fafb;

  @media (max-width: 575px) {
    padding: 12px;
    gap: 12px;
  }

  &:hover {
    background: #f3f4f6;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const BidContent = styled.div`
  width: 100%;
  min-width: 0; // Prevents text overflow
`;

const BidActions = styled(Space)`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;

  @media (max-width: 575px) {
    gap: 6px;
  }

  .ant-btn {
    margin: 0 !important;
    white-space: nowrap;
  }
`;

const StyledCollapse = styled(Collapse)`
  margin-top: 20px;
  background: transparent;
  border: none;

  @media (max-width: 575px) {
    margin-top: 16px;
  }

  .ant-collapse-header {
    padding: 12px 16px !important;
    font-weight: 600 !important;
    background: #f9fafb;
    border-radius: 12px;
  }

  .ant-collapse-content {
    border: none;
    background: transparent;
  }

  .ant-collapse-content-box {
    padding: 16px 0 !important;

    @media (max-width: 575px) {
      padding: 12px 0 !important;
    }
  }
`;

const PlatformOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const ContentTypeCard = styled(Card)`
  border-radius: 12px;
  padding: 20px;
  min-height: 160px;
  text-align: center;
  cursor: pointer;
  border: 2px solid ${props => props.selected ? '#26A69A' : '#e8ecef'};
  background: ${props => props.selected ? '#f0fdfa' : '#fff'};
  transition: all 0.3s ease;
  
  &:hover {
    background: #f0fdfa;
    border-color: #26A69A;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(38, 166, 154, 0.1);
  }

  .ant-card-body {
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
`;

const ContentTypeIcon = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: all 0.3s ease;

  svg {
    width: 28px;
    height: 28px;
    color: ${props => props.selected ? '#26A69A' : '#4b5563'};
    transition: all 0.3s ease;
  }

  &:hover svg {
    transform: scale(1.1);
    color: #26A69A;
  }
`;

const ContentTypeTitle = styled(Text)`
  font-weight: 600;
  font-size: 15px;
  color: ${props => props.selected ? '#26A69A' : '#1f2937'};
  margin-bottom: 4px;
`;

const ContentTypeDescription = styled(Text)`
  font-size: 12px;
  color: #6b7280;
  text-align: center;
  line-height: 1.4;
`;

const StyledButton = styled(Button)`
  border-radius: 24px;
  padding: 10px 24px;
  background: ${props => props.primary ? 'linear-gradient(135deg, #26A69A, #4DB6AC)' : '#fff'};
  border: ${props => props.primary ? 'none' : '1px solid #d1d5db'};
  color: ${props => props.primary ? '#fff' : '#4b5563'};
  font-weight: 600;
  font-size: 14px;
  height: auto;
  white-space: nowrap;
  min-width: 120px;

  @media (max-width: 575px) {
    padding: 8px 16px;
    font-size: 13px;
    min-width: 100px;
  }

  &:hover {
    background: ${props => props.primary ? 'linear-gradient(135deg, #4DB6AC, #26A69A)' : '#e6f7ff'};
    color: ${props => props.primary ? '#fff' : '#26A69A'};
    border-color: ${props => props.primary ? 'none' : '#26A69A'};
  }
`;

const StyledInput = styled(Input)`
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 14px;
`;

const StyledTextArea = styled(TextArea)`
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 14px;
`;

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const badgeVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

const audienceIcons = {
  "Gen Z (18-24)": <FaBaby style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Millennials (25-34)": <FaUserTie style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Gen X (35-54)": <FaBriefcase style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Boomers (55+)": <FaGraduationCap style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Families": <MdFamilyRestroom style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Professionals": <FaUserTie style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Students": <FaGraduationCap style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Gamers": <FaGamepad style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Fitness Enthusiasts": <FaRunning style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Fashion Lovers": <FaTshirt style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Tech Enthusiasts": <FaLaptop style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Foodies": <FaUtensils style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Travelers": <FaPlane style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Beauty Enthusiasts": <GiLipstick style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Parents": <FaBaby style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Pet Owners": <FaDog style={{ fontSize: '16px', color: '#26A69A' }} />,
  "DIY Enthusiasts": <FaTools style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Music Lovers": <FaMusic style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Book Readers": <FaBook style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Eco-Conscious": <FaLeaf style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Luxury Buyers": <FaGem style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Budget Shoppers": <FaShoppingCart style={{ fontSize: '16px', color: '#26A69A' }} />,
};

const AudienceOption = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  
  .audience-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: #f0fdfa;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .audience-label {
    font-size: 14px;
    color: #1f2937;
  }

  &:hover .audience-icon {
    background: #e6f7ff;
    transform: scale(1.05);
  }
`;

const StyledSelect = styled(Select)`
  .ant-select-selector {
    border-radius: 12px !important;
    padding: 8px 16px !important;
    border: 1px solid #e8ecef !important;
    background: #fff !important;
    transition: all 0.3s ease !important;
    
    &:hover {
      border-color: #26A69A !important;
    }
  }

  .ant-select-selection-item {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    padding: 4px 8px !important;
    background: #f0fdfa !important;
    border-radius: 6px !important;
    margin: 2px !important;
  }

  .ant-select-dropdown {
    border-radius: 12px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
    padding: 8px !important;
  }

  .ant-select-item {
    border-radius: 8px !important;
    margin: 4px 0 !important;
    transition: all 0.2s ease !important;
    
    &:hover {
      background: #f0fdfa !important;
    }
  }

  .ant-select-item-option-selected {
    background: #e6f7ff !important;
  }
`;

const topicIcons = {
  "Fashion": <FaTshirt style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Beauty": <GiLipstick style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Fitness": <FaRunning style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Gaming": <FaGamepad style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Travel": <FaPlane style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Food & Drink": <FaUtensils style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Technology": <FaLaptop style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Lifestyle": <FaPalette style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Education": <FaGraduationCap style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Entertainment": <FaFilm style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Health & Wellness": <FaHeartbeat style={{ fontSize: '16px', color: '#26A69A' }} />,
  "DIY & Crafts": <FaTools style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Parenting": <FaBaby style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Sustainability": <FaLeaf style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Business & Finance": <FaChartLine style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Automotive": <FaCar style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Home & Garden": <FaHome style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Pets": <FaPaw style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Music": <FaMusic style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Books & Literature": <FaBook style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Movies & TV": <FaTv style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Sports": <FaFutbol style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Photography": <FaCamera style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Art & Design": <FaPaintBrush style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Science": <FaFlask style={{ fontSize: '16px', color: '#26A69A' }} />,
  "News & Politics": <FaNewspaper style={{ fontSize: '16px', color: '#26A69A' }} />,
  "Humor & Memes": <FaLaughSquint style={{ fontSize: '16px', color: '#26A69A' }} />
};

const TopicOption = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  
  .topic-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: #f0fdfa;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .topic-label {
    font-size: 14px;
    color: #1f2937;
  }

  &:hover .topic-icon {
    background: #e6f7ff;
    transform: scale(1.05);
  }
`;

const ActionButtons = styled(Space)`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;

  @media (max-width: 575px) {
    margin-top: 16px;
    gap: 6px;
  }

  .ant-btn {
    margin: 0 !important;
  }
`;

const StyledModal = styled(Modal)`
  .ant-modal {
    top: 50%;
    transform: translateY(-50%);
    margin: 0;
    padding: 0;
    max-width: 100%;
    width: 100% !important;
  }

  .ant-modal-wrap {
    overflow: hidden;
  }

  .ant-modal-mask {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1000;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.45);
  }

  .ant-modal-content {
    border-radius: 16px;
    overflow: hidden;
    z-index: 1001;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    width: 100%;
    max-width: 600px;
    position: relative;
    background: #fff;

    @media (max-width: 575px) {
      max-height: 100vh;
      border-radius: 0;
    }
  }

  .ant-modal-header {
    border-bottom: 1px solid #e5e7eb;
    padding: 16px 24px;
    margin: 0;
    flex-shrink: 0;
    background: #fff;
    position: sticky;
    top: 0;
    z-index: 2;

    @media (max-width: 575px) {
      padding: 12px 16px;
    }
  }

  .ant-modal-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
    position: relative;
    background: #fff;
    -webkit-overflow-scrolling: touch;
    max-height: calc(90vh - 120px);

    @media (max-width: 575px) {
      padding: 16px;
      max-height: calc(100vh - 120px);
    }

    /* Customize scrollbar for better UX */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  }

  .ant-modal-footer {
    border-top: 1px solid #e5e7eb;
    padding: 16px 24px;
    margin: 0;
    flex-shrink: 0;
    background: #fff;
    position: sticky;
    bottom: 0;
    z-index: 2;

    @media (max-width: 575px) {
      padding: 12px 16px;
    }
  }
`;

// eslint-disable-next-line no-unused-vars
const ModalBidItem = styled.div`
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 16px;
  background: #fff;

  @media (max-width: 575px) {
    padding: 12px;
    margin-bottom: 12px;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

// eslint-disable-next-line no-unused-vars
const ModalBidContent = styled.div`
  margin-bottom: 16px;

  @media (max-width: 575px) {
    margin-bottom: 12px;
  }
`;

// eslint-disable-next-line no-unused-vars
const ModalBidActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 575px) {
    gap: 6px;
  }

  .ant-btn {
    margin: 0 !important;
    white-space: nowrap;
  }
`;

// eslint-disable-next-line no-unused-vars
const HelpButton = styled(Button)`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #26A69A;
  border: none;
  box-shadow: 0 4px 12px rgba(38, 166, 154, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(38, 166, 154, 0.3);
    background: #4DB6AC;
  }

  .anticon {
    font-size: 24px;
    color: white;
  }
`;

const DraftModalBody = styled.div`
  padding: 24px 8px 8px 8px;
  background: #fff;
  border-radius: 16px;
  @media (max-width: 600px) {
    padding: 12px 2px 2px 2px;
  }
`;

const DraftFormSection = styled.div`
  margin-bottom: 22px;
  @media (max-width: 600px) {
    margin-bottom: 16px;
  }
`;

const DraftFormLabel = styled(Form.Item)`
  .ant-form-item-label > label {
    font-weight: 700;
    font-size: 1.08rem;
    color: #1f2937;
  }
`;

const DraftSubmitButton = styled(Button)`
  background: linear-gradient(90deg, #10b981 0%, #4ade80 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 17px;
  width: 100%;
  height: 48px;
  margin-top: 10px;
  box-shadow: 0 2px 8px rgba(16,185,129,0.10);
  &:hover, &:focus {
    background: linear-gradient(90deg, #22d3ee 0%, #10b981 100%);
    color: #fff;
  }
  @media (max-width: 600px) {
    font-size: 15px;
    height: 44px;
  }
`;

const ContentTypeCardRefined = styled(ContentTypeCard)`
  min-height: 120px;
  padding: 16px 8px;
  margin-bottom: 18px;
  .ant-card-body {
    gap: 10px;
  }
`;

const ContentTypeTitleRefined = styled(ContentTypeTitle)`
  font-size: 17px;
  @media (max-width: 600px) {
    font-size: 16px;
  }
`;

const SponsorOffers = () => {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitContentModalVisible, setSubmitContentModalVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [selectedDraft, setSelectedDraft] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [run, setRun] = useState(false);
  const [editingDraft, setEditingDraft] = useState(null);
  const [contentFormat, setContentFormat] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [contentForm] = Form.useForm();
  const [createForm] = Form.useForm();

  // Create refs for tour targets
  // eslint-disable-next-line no-unused-vars
  const draftCardRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const offerActionsRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const submitContentRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const editDraftRef = useRef(null);

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching sponsor drafts at:', `${api.defaults.baseURL}/my-sponsor-drafts`);
      // eslint-disable-next-line no-unused-vars
      const response = await api.get('/my-sponsor-drafts');
      console.log('🔍 Sponsor drafts response:', {
        status: response.status,
        data: response.data,
        headers: response.headers,
      });
      setDrafts(response.data);
    } catch (error) {
      console.error('🔥 Error fetching drafts:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request_url: `${api.defaults.baseURL}/my-sponsor-drafts`,
        timestamp: new Date().toISOString(),
        base_url: api.defaults.baseURL,
        env_backend_url: process.env.REACT_APP_BACKEND_URL,
      });
      let errorMessage = 'Failed to fetch drafts. Please try again later.';
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Unable to connect to the server. Please check your internet connection or contact support at partner@newcollab.co.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Please log in to view your drafts.';
        navigate('/login', { replace: true });
      } else if (error.response?.status === 404) {
        errorMessage = 'No sponsor drafts found.';
        setDrafts([]);
      }
      message.error(errorMessage);
      setDrafts([]);
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);
  
  useEffect(() => {
    // Remove the auto-start tour logic
  }, []);
  
  const handleAction = async (bidId, action) => {
    try {
      console.log('🔍 Performing bid action:', { bidId, action });
      const { data: { booking_id } } = await api.post(
        `/sponsor-bids/${bidId}/action`,
        { action }
      );
      console.log('🔍 Bid action response:', { booking_id });
  
      message.success({
        content: (
          <span>
            Bid {action}ed successfully!
            {action === 'accept' && booking_id && (
              <>
                {' Booking created: '}
                <a
                  href={`/creator/dashboard/bookings/${booking_id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/creator/dashboard/bookings/${booking_id}`;
                  }}
                >
                  {booking_id}
                </a>
              </>
            )}
          </span>
        ),
        duration: 5,
      });
  
      await fetchDrafts();
    } catch (error) {
      console.error('🔥 Error in handleAction:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request_url: `${api.defaults.baseURL}/sponsor-bids/${bidId}/action`,
        timestamp: new Date().toISOString(),
      });
      message.error(`Failed to process bid action: ${error.response?.data?.error || 'Unknown error'}`);
    }
  };
  
  const handleOpenSubmitContentModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setSubmitContentModalVisible(true);
    const draft = drafts.find(d => d.bids.some(b => b.booking_id === bookingId));
    const bid = draft?.bids.find(b => b.booking_id === bookingId);
    if (bid?.content_link) {
      contentForm.setFieldsValue({
        content_link: bid.content_link,
        submission_notes: bid.submission_notes,
      });
    }
  };
  
  const handleCloseSubmitContentModal = () => {
    setSubmitContentModalVisible(false);
    setSelectedBookingId(null);
    contentForm.resetFields();
  };
  
  const handleSubmitContent = async (values) => {
    try {
      console.log('🔍 Submitting content for booking:', selectedBookingId);
      await api.post(
        `/bookings/${selectedBookingId}/submit-content`,
        values
      );
      message.success('Content submitted successfully!');
      handleCloseSubmitContentModal();
      await fetchDrafts();
    } catch (error) {
      console.error('🔥 Error submitting content:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request_url: `${api.defaults.baseURL}/bookings/${selectedBookingId}/submit-content`,
        timestamp: new Date().toISOString(),
      });
      message.error(`Failed to submit content: ${error.response?.data?.error || 'Unknown error'}`);
    }
  };
  
  const handlePublishContent = async (bookingId) => {
    try {
      console.log('🔍 Publishing content for booking:', bookingId);
      await api.put(
        `/bookings/${bookingId}/status`,
        { status: 'Published' }
      );
      message.success('Content marked as published!');
      await fetchDrafts();
    } catch (error) {
      console.error('🔥 Error publishing content:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request_url: `${api.defaults.baseURL}/bookings/${bookingId}/status`,
        timestamp: new Date().toISOString(),
      });
      message.error(`Failed to publish content: ${error.response?.data?.error || 'Unknown error'}`);
    }
  };
  
  const handleDelete = async (draftId) => {
    try {
      console.log('🔍 Deleting draft:', draftId);
      await api.delete(`/sponsor-drafts/${draftId}`);
      message.success('Draft deleted successfully!');
      setDrafts(drafts.filter((draft) => draft.id !== draftId));
    } catch (error) {
      console.error('🔥 Error deleting draft:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request_url: `${api.defaults.baseURL}/sponsor-drafts/${draftId}`,
        timestamp: new Date().toISOString(),
      });
      message.error(`Failed to delete draft: ${error.response?.data?.error || 'Unknown error'}`);
    }
  };
  
  const handleEdit = (draft) => {
    console.log('🔍 Editing draft:', draft);
    setEditingDraft(draft);
    setContentFormat(draft.content_format);
    setEditModalVisible(true);
    form.setFieldsValue({
      description: draft.description || '',
      platforms: Array.isArray(draft.platforms) ? draft.platforms : [],
      audience_targets: Array.isArray(draft.audience_targets) ? draft.audience_targets : [],
      content_format: draft.content_format || '',
      topics: Array.isArray(draft.topics) ? draft.topics : [],
      gifting_invite_required: draft.gifting_invite_required === 'Yes',
      projected_views: draft.projected_views || '',
      min_bid: draft.min_bid ? parseFloat(draft.min_bid) : undefined,
    });
  };
  
  const handleUpdateDraft = async (values) => {
    try {
      console.log('🔍 Updating draft:', editingDraft.id, values);
      const formData = new FormData();
      formData.append('description', values.description);
      formData.append('platforms', JSON.stringify(values.platforms || []));
      formData.append('min_bid', values.min_bid || '');
      formData.append('audience_targets', JSON.stringify(values.audience_targets || []));
      formData.append('content_format', values.content_format || '');
      formData.append('topics', JSON.stringify(values.topics || []));
      formData.append('gifting_invite_required', values.gifting_invite_required ? 'Yes' : 'No');
      formData.append('projected_views', values.projected_views || '');
  
      // Log form data for debugging
      const formDataEntries = Object.fromEntries(formData.entries());
      console.log('🔍 Form data payload:', formDataEntries);
  
      // eslint-disable-next-line no-unused-vars
      const response = await api.put(
        `/sponsor-drafts/${editingDraft.id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
  
      console.log('🔍 Draft update response:', {
        status: response.status,
        data: response.data,
      });
      message.success('Draft updated successfully!');
      setEditModalVisible(false);
      form.resetFields();
      setContentFormat(null);
      await fetchDrafts();
    } catch (error) {
      console.error('🔥 Error updating draft:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request_url: `${api.defaults.baseURL}/sponsor-drafts/${editingDraft.id}`,
        timestamp: new Date().toISOString(),
        base_url: api.defaults.baseURL,
        env_backend_url: process.env.REACT_APP_BACKEND_URL,
      });
      let errorMessage = 'Failed to update draft. Please try again later.';
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Unable to connect to the server. This may be due to a CORS configuration issue or server unavailability. Please contact support at partner@newcollab.co.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Unauthorized: Please log in and try again.';
        navigate('/login', { replace: true });
      } else if (error.response?.status === 404) {
        errorMessage = 'Draft not found. It may have been deleted or does not exist.';
      } else if (error.response?.status === 405) {
        errorMessage = 'Method not allowed. The server does not support updating drafts. Please contact support at partner@newcollab.co.';
      }
      message.error(errorMessage);
    }
  };
  
  const handleCreateDraft = async (values) => {
    try {
      console.log('🔍 Creating new draft:', values);
      const formData = new FormData();
      formData.append('description', values.description);
      formData.append('platforms', JSON.stringify(values.platforms || []));
      formData.append('min_bid', values.min_bid || '');
      formData.append('audience_targets', JSON.stringify(values.audience_targets || []));
      formData.append('content_format', values.content_format || '');
      formData.append('topics', JSON.stringify(values.topics || []));
      formData.append('gifting_invite_required', values.gifting_invite_required ? 'Yes' : 'No');
      formData.append('projected_views', values.projected_views || '');
      formData.append('bidding_deadline', values.bidding_deadline ? values.bidding_deadline.format('YYYY-MM-DD') : '');
      if (values.snippet) {
        formData.append('snippet', values.snippet);
      }
  
      // eslint-disable-next-line no-unused-vars
      const response = await api.post('/sponsor-draft', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      message.success('Draft created successfully!');
      setCreateModalVisible(false);
      createForm.resetFields();
      setContentFormat(null);
      await fetchDrafts();
    } catch (error) {
      console.error('🔥 Error creating draft:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request_url: `${api.defaults.baseURL}/sponsor-draft`,
        timestamp: new Date().toISOString(),
      });
      message.error(`Failed to create draft: ${error.response?.data?.error || 'Unknown error'}`);
    }
  };

  const getInitials = (username) => {
    if (!username) return 'U';
    const names = username.split(' ');
    return names.map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const toggleDescription = (draftId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [draftId]: !prev[draftId],
    }));
  };

  const formatFollowerCount = (count) => {
    if (!count) return "N/A";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "N/A";
    }
  };

  const contentFormats = [
    { 
      type: "Reels", 
      icon: <FiVideo style={{ fontSize: '28px', color: '#26A69A' }} />, 
      emoji: "🎬",
      color: '#26A69A',
      description: 'Short-form vertical videos'
    },
    { 
      type: "Stories", 
      icon: <FiCamera style={{ fontSize: '28px', color: '#26A69A' }} />, 
      emoji: "📸",
      color: '#26A69A',
      description: 'Ephemeral photo/video content'
    },
    { 
      type: "Short Videos", 
      icon: <FiFilm style={{ fontSize: '28px', color: '#26A69A' }} />, 
      emoji: "🎥",
      color: '#26A69A',
      description: 'Quick, engaging video content'
    },
    { 
      type: "Live", 
      icon: <MdOutlineLiveTv style={{ fontSize: '28px', color: '#26A69A' }} />, 
      emoji: "🔴",
      color: '#26A69A',
      description: 'Real-time streaming content'
    },
    { 
      type: "Podcast", 
      icon: <MdOutlineAudiotrack style={{ fontSize: '28px', color: '#26A69A' }} />, 
      emoji: "🎙️",
      color: '#26A69A',
      description: 'Audio content and discussions'
    },
    { 
      type: "Static Post", 
      icon: <FiImage style={{ fontSize: '28px', color: '#26A69A' }} />, 
      emoji: "🖼️",
      color: '#26A69A',
      description: 'Image-based content'
    },
  ];

  const platforms = [
    { 
      name: "Instagram", 
      icon: <FaInstagram style={{ color: '#E1306C', fontSize: '20px' }} />, 
      emoji: "📷",
      color: '#E1306C'
    },
    { 
      name: "TikTok", 
      icon: <FaTiktok style={{ color: '#000000', fontSize: '20px' }} />, 
      emoji: "🎵",
      color: '#000000'
    },
    { 
      name: "YouTube", 
      icon: <FaYoutube style={{ color: '#FF0000', fontSize: '20px' }} />, 
      emoji: "📹",
      color: '#FF0000'
    },
    { 
      name: "Facebook", 
      icon: <FaFacebook style={{ color: '#1877F2', fontSize: '20px' }} />, 
      emoji: "📘",
      color: '#1877F2'
    },
    { 
      name: "Twitter", 
      icon: <FaTwitter style={{ color: '#1DA1F2', fontSize: '20px' }} />, 
      emoji: "🐦",
      color: '#1DA1F2'
    },
    { 
      name: "LinkedIn", 
      icon: <FaLinkedin style={{ color: '#0A66C2', fontSize: '20px' }} />, 
      emoji: "💼",
      color: '#0A66C2'
    },
    { 
      name: "Snapchat", 
      icon: <FaSnapchat style={{ color: '#FFFC00', fontSize: '20px' }} />, 
      emoji: "👻",
      color: '#FFFC00'
    },
    { 
      name: "Pinterest", 
      icon: <FaPinterest style={{ color: '#E60023', fontSize: '20px' }} />, 
      emoji: "📌",
      color: '#E60023'
    },
    { 
      name: "Twitch", 
      icon: <FaTwitch style={{ color: '#9146FF', fontSize: '20px' }} />, 
      emoji: "🎮",
      color: '#9146FF'
    },
  ];

  // eslint-disable-next-line no-unused-vars
  const getPlatformIcon = (platformName) => {
    const platform = platforms.find(p => p.name.toLowerCase() === platformName.toLowerCase());
    return platform ? platform.icon : null;
  };

  // eslint-disable-next-line no-unused-vars
  const getPlatformEmoji = (platformName) => {
    const platform = platforms.find(p => p.name.toLowerCase() === platformName.toLowerCase());
    return platform ? platform.emoji : "";
  };

  const audienceTargets = [
    "Gen Z (18-24)", "Millennials (25-34)", "Gen X (35-54)", "Boomers (55+)", "Families",
    "Professionals", "Students", "Gamers", "Fitness Enthusiasts", "Fashion Lovers",
    "Tech Enthusiasts", "Foodies", "Travelers", "Beauty Enthusiasts", "Parents",
    "Pet Owners", "DIY Enthusiasts", "Music Lovers", "Book Readers", "Eco-Conscious",
    "Luxury Buyers", "Budget Shoppers",
  ];

  const topics = [
    "Fashion", "Beauty", "Fitness", "Gaming", "Travel", "Food & Drink", "Technology",
    "Lifestyle", "Education", "Entertainment", "Health & Wellness", "DIY & Crafts",
    "Parenting", "Sustainability", "Business & Finance", "Automotive", "Home & Garden",
    "Pets", "Music", "Books & Literature", "Movies & TV", "Sports", "Photography",
    "Art & Design", "Science", "News & Politics", "Humor & Memes",
  ];

  const viewBrackets = [
    "0-1K", "1K-5K", "5K-10K", "10K-50K", "50K-100K", "100K-500K", "500K+",
  ];

  const getTagGradient = (type, category) => {
    switch (category) {
      case 'platform':
        const platform = platforms.find(p => p.name.toLowerCase() === type.toLowerCase());
        return platform ? `linear-gradient(135deg, ${platform.color}, ${platform.color}dd)` : 'linear-gradient(135deg, #3b82f6, #2563eb)';
      case 'audience':
        return 'linear-gradient(135deg, #22d3ee, #06b6d4)';
      case 'topic':
        return 'linear-gradient(135deg, #a855f7, #7e22ce)';
      case 'region':
        return 'linear-gradient(135deg, #10b981, #059669)';
      case 'status':
        switch (type) {
          case 'New': return 'linear-gradient(135deg, #3b82f6, #2563eb)';
          case 'Accepted': return 'linear-gradient(135deg, #22c55e, #16a34a)';
          case 'Expired': return 'linear-gradient(135deg, #ef4444, #dc2626)';
          case 'Live': return 'linear-gradient(135deg, #22c55e, #16a34a)';
          case 'Completed': return 'linear-gradient(135deg, #6b7280, #4b5563)';
          case 'Pending': return 'linear-gradient(135deg, #3b82f6, #2563eb)';
          case 'Approved': return 'linear-gradient(135deg, #22c55e, #16a34a)';
          case 'Published': return 'linear-gradient(135deg, #6b7280, #4b5563)';
          case 'Revision Requested': return 'linear-gradient(135deg, #ef4444, #dc2626)';
          default: return 'linear-gradient(135deg, #f97316, #ea580c)';
        }
      default:
        return 'linear-gradient(135deg, #9ca3af, #6b7280)';
    }
  };

  // Add useEffect to handle body scroll lock
  useEffect(() => {
    if (createModalVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [createModalVisible]);

  return (
    <Container>
      <Row justify="space-between" align="middle" style={{ marginBottom: 32 }}>
        <Col xs={24} sm={24} md={24} lg={24}>
          <Title level={2} style={{ fontSize: '28px', color: '#1f2937', marginBottom: 8 }}>
            Content bids
          </Title>
          <Text style={{ color: '#4b5563', fontSize: '16px' }}>
            Create your content opportunities and track your bids below.
          </Text>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <StyledButton
            type="primary"
            primary
            onClick={() => setCreateModalVisible(true)}
            aria-label="Create new sponsor draft"
            className="create-draft-button"
          >
            Create New Draft
          </StyledButton>
        </Col>
      </Row>

      {loading ? (
        <Spin style={{ display: "block", margin: "50px auto" }} />
      ) : drafts.length === 0 ? (
        <Text style={{ display: "block", textAlign: "center", marginTop: 20, color: '#6b7280', fontSize: '16px' }}>
          No sponsor offers submitted yet. Create one now!
        </Text>
      ) : (
        <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
          {drafts.map((draft) => (
            <Col xs={24} sm={24} md={12} lg={8} key={draft.id} style={{ padding: '0 4px' }}>
              <motion.div variants={cardVariants} initial="hidden" animate="visible">
                <DraftCard className="draft-card">
                  <CardHeader>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <Text strong style={{ fontSize: '18px', color: '#1f2937' }}>
                        {draft.content_format || "N/A"}
                      </Text>
                      <motion.div variants={badgeVariants} initial="rest" whileHover="hover">
                        <ContentBadge gradient={getTagGradient(
                          draft.status === "Pending" ? "New" :
                          draft.status === "Sponsored" ? "Published" :
                          draft.status === "Approved" ? "Live" :
                          draft.status, 'status')}>
                          {draft.status === "Pending" ? "New" :
                           draft.status === "Sponsored" ? "Published" :
                           draft.status === "Approved" ? "Live" :
                           draft.status || "N/A"}
                        </ContentBadge>
                      </motion.div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CreatorInfo>
                      <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
                        <CreatorAvatar
                          src={draft.image_profile}
                          size={56}
                          style={{ backgroundColor: '#26A69A', color: '#fff' }}
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/56x56';
                            return true;
                          }}
                        >
                          {getInitials(draft.username)}
                        </CreatorAvatar>
                      </motion.div>
                      <div>
                        <CreatorName to={`/creator/profile/${draft.creator_id}`}>
                          @{draft.username || "Unknown Creator"}
                        </CreatorName>
                        <StatsContainer>
                          <StatItem>
                            <FaUserFriends style={{ color: '#26A69A' }} />
                            {formatFollowerCount(draft.followers_count)}
                          </StatItem>
                          <StatItem>
                            <FaChartLine style={{ color: '#26A69A' }} />
                            {draft.engagement_rate ? `${draft.engagement_rate}%` : "N/A"}
                          </StatItem>
                        </StatsContainer>
                      </div>
                    </CreatorInfo>

                    {draft.snippet_url ? (
                      <VideoContainer>
                        <StyledVideo controls src={draft.snippet_url} />
                      </VideoContainer>
                    ) : (
                      <VideoContainer>
                        <VideoPlaceholder>
                          <Text style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center' }}>
                            No video preview available
                          </Text>
                        </VideoPlaceholder>
                      </VideoContainer>
                    )}

                    <DescriptionText>
                      {draft.description}
                      {draft.description.length > 100 && (
                        <ReadMoreLink onClick={() => toggleDescription(draft.id)}>
                          Read More
                        </ReadMoreLink>
                      )}
                    </DescriptionText>

                    <FieldLabel>Platforms</FieldLabel>
                    <TagList>
                      {Array.isArray(draft.platforms) && draft.platforms.length > 0 ? (
                        draft.platforms.map((platform) => (
                          <motion.div key={platform} variants={badgeVariants} initial="rest" whileHover="hover">
                            <PlatformItem>
                              {platforms.find(p => p.name === platform)?.icon}
                              <span>{platform}</span>
                            </PlatformItem>
                          </motion.div>
                        ))
                      ) : (
                        <Text style={{ color: '#6b7280', fontSize: '14px' }}>N/A</Text>
                      )}
                    </TagList>

                    <FieldLabel>Target Audiences</FieldLabel>
                    <TagList>
                      {Array.isArray(draft.audience_targets) && draft.audience_targets.length > 0 ? (
                        draft.audience_targets.map((target) => (
                          <motion.div key={target} variants={badgeVariants} initial="rest" whileHover="hover">
                            <PlatformItem>
                              {audienceIcons[target]}
                              <span>{target}</span>
                            </PlatformItem>
                          </motion.div>
                        ))
                      ) : (
                        <Text style={{ color: '#6b7280', fontSize: '14px' }}>N/A</Text>
                      )}
                    </TagList>

                    <FieldLabel>Topics</FieldLabel>
                    <TagList>
                      {Array.isArray(draft.topics) && draft.topics.length > 0 ? (
                        draft.topics.map((topic) => (
                          <motion.div key={topic} variants={badgeVariants} initial="rest" whileHover="hover">
                            <PlatformItem>
                              {topicIcons[topic]}
                              <span>{topic}</span>
                            </PlatformItem>
                          </motion.div>
                        ))
                      ) : (
                        <Text style={{ color: '#6b7280', fontSize: '14px' }}>N/A</Text>
                      )}
                    </TagList>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)', 
                      gap: '16px', 
                      marginTop: '20px',
                      '@media (max-width: 575px)': {
                        gridTemplateColumns: '1fr',
                        gap: '12px',
                        marginTop: '16px'
                      }
                    }}>
                      <div>
                        <FieldLabel>Gifting/Invite Required</FieldLabel>
                        <Text>{draft.gifting_invite_required || "N/A"}</Text>
                      </div>
                      <div>
                        <FieldLabel>Posting Date</FieldLabel>
                        <Text>{formatDate(draft.posting_date)}</Text>
                      </div>
                      <div>
                        <FieldLabel>Projected Views</FieldLabel>
                        <Text>{draft.projected_views || "N/A"}</Text>
                      </div>
                      <div>
                        <FieldLabel>Min Bid</FieldLabel>
                        <Text>{draft.min_bid ? require('../utils/currency').formatPrice(draft.min_bid) : "N/A"}</Text>
                      </div>
                      <div>
                        <FieldLabel>Bidding Deadline</FieldLabel>
                        <Text>{formatDate(draft.bidding_deadline)}</Text>
                      </div>
                      <div>
                        <FieldLabel>Bids Received</FieldLabel>
                        <Text>{draft.bids ? draft.bids.length : 0}</Text>
                      </div>
                    </div>

                    {draft.bids && draft.bids.length > 0 && (
                      <StyledCollapse
                        expandIcon={({ isActive }) => (isActive ? <UpOutlined /> : <DownOutlined />)}
                      >
                        <Panel header={`View Bids (${draft.bids.length})`} key="1">
                          {draft.bids.map((bid) => {
                            return (
                              <BidItem key={bid.bid_id}>
                                <BidContent>
                                  <Text strong style={{ color: '#1f2937', fontSize: '15px', display: 'block', marginBottom: '4px' }}>
                                    {bid.brand_name || "Unknown Brand"}
                                  </Text>
                                  <Text style={{ color: '#4b5563', display: 'block', marginBottom: '4px' }}>
                                    {bid.bid_amount ? require('../utils/currency').formatPrice(bid.bid_amount) : "N/A"} - {bid.pitch || "No pitch provided"}
                                  </Text>
                                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                    <ContentBadge gradient={getTagGradient(
                                      bid.status === "Pending" ? "New" :
                                      bid.status === "Accept" ? "Accepted" :
                                      bid.status === "Sponsored" ? "Published" :
                                      bid.status === "Approved" ? "Live" :
                                      bid.status, 'status')}>
                                      {bid.status === "Pending" ? "New" :
                                       bid.status === "Accept" ? "Accepted" :
                                       bid.status === "Sponsored" ? "Published" :
                                       bid.status === "Approved" ? "Live" :
                                       bid.status}
                                    </ContentBadge>
                                    {bid.booking_id && (
                                      <>
                                        {bid.content_status === "Pending" && (
                                          <ContentBadge gradient={getTagGradient("New", 'status')}>
                                            Content Pending
                                          </ContentBadge>
                                        )}
                                        {bid.content_status === "Approved" && (
                                          <ContentBadge gradient={getTagGradient("Live", 'status')}>
                                            Content Approved
                                          </ContentBadge>
                                        )}
                                        {bid.content_status === "Published" && (
                                          <ContentBadge gradient={getTagGradient("Completed", 'status')}>
                                            Content Published
                                          </ContentBadge>
                                        )}
                                        {bid.content_status === "Revision Requested" && (
                                          <ContentBadge gradient={getTagGradient("Expired", 'status')}>
                                            Revision Needed
                                          </ContentBadge>
                                        )}
                                      </>
                                    )}
                                    {bid.payment_status && (
                                      <ContentBadge gradient={getTagGradient(bid.payment_status, 'status')}>
                                        {bid.payment_status}
                                      </ContentBadge>
                                    )}
                                  </div>
                                  {bid.booking_id && (
                                    <>
                                      <Text style={{ color: '#6b7280', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                                        Booking ID: <Link to={`/creator/dashboard/bookings/${bid.booking_id}`} style={{ color: '#26A69A' }}>
                                          {bid.booking_id}
                                        </Link>
                                      </Text>
                                      {bid.content_link && (
                                        <Text style={{ color: '#6b7280', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                                          Content Link: <a href={bid.content_link} target="_blank" rel="noopener noreferrer" style={{ color: '#26A69A' }}>
                                            {bid.content_link}
                                          </a>
                                        </Text>
                                      )}
                                      {bid.submission_notes && (
                                        <Text style={{ color: '#6b7280', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                                          Notes: {bid.submission_notes}
                                        </Text>
                                      )}
                                      {bid.revision_notes && (
                                        <Text style={{ color: '#ef4444', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                                          Revision Notes: {bid.revision_notes}
                                        </Text>
                                      )}
                                    </>
                                  )}
                                </BidContent>
                                <BidActions>
                                  {bid.status === "Pending" && (
                                    <>
                                      <StyledButton
                                        type="primary"
                                        primary
                                        size="small"
                                        onClick={() => handleAction(bid.bid_id, "accept")}
                                        aria-label={`Accept bid from ${bid.brand_name}`}
                                      >
                                        Accept
                                      </StyledButton>
                                      <StyledButton
                                        danger
                                        size="small"
                                        onClick={() => handleAction(bid.bid_id, "reject")}
                                        aria-label={`Reject bid from ${bid.brand_name}`}
                                      >
                                        Reject
                                      </StyledButton>
                                    </>
                                  )}
                                  {bid.status === "Accepted" && (
                                    <StyledButton
                                      type="primary"
                                      primary
                                      size="small"
                                      disabled
                                      style={{ background: '#22c55e', borderColor: '#22c55e' }}
                                    >
                                      Accepted
                                    </StyledButton>
                                  )}
                                  {bid.status === "Accepted" && draft.status === "Sponsored" && (
                                    <>
                                      {(bid.content_status === "Pending" || bid.content_status === "Revision Requested") && (
                                        <StyledButton
                                          type="primary"
                                          primary
                                          size="small"
                                          onClick={() => handleOpenSubmitContentModal(bid.booking_id)}
                                          aria-label={bid.content_status === "Pending" ? "Submit content" : "Update content"}
                                          className="submit-content"
                                        >
                                          {bid.content_status === "Pending" ? "Submit Content" : "Update Content"}
                                        </StyledButton>
                                      )}
                                      {bid.content_status === "Approved" && (
                                        <StyledButton
                                          type="primary"
                                          primary
                                          size="small"
                                          onClick={() => handlePublishContent(bid.booking_id)}
                                          aria-label="Publish content"
                                        >
                                          Publish Content
                                        </StyledButton>
                                      )}
                                    </>
                                  )}
                                </BidActions>
                              </BidItem>
                            );
                          })}
                        </Panel>
                      </StyledCollapse>
                    )}
                    <ActionButtons className="offer-actions">
                      <StyledButton
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(draft)}
                        disabled={draft.status === "Sponsored" || (draft.bids && draft.bids.some(bid => bid.status === "Accepted"))}
                        aria-label="Edit draft"
                        className="edit-draft"
                      >
                        Edit Draft
                      </StyledButton>
                      <Popconfirm
                        title="Are you sure you want to delete this draft?"
                        onConfirm={() => handleDelete(draft.id)}
                        disabled={draft.status === "Sponsored" || (draft.bids && draft.bids.some(bid => bid.status === "Accepted"))}
                      >
                        <StyledButton
                          type="link"
                          danger
                          icon={<DeleteOutlined />}
                          disabled={draft.status === "Sponsored" || (draft.bids && draft.bids.some(bid => bid.status === "Accepted"))}
                          aria-label="Delete draft"
                        >
                          Delete Draft
                        </StyledButton>
                      </Popconfirm>
                    </ActionButtons>
                  </CardContent>
                </DraftCard>
              </motion.div>
            </Col>
          ))}
        </Row>
      )}

      <StyledModal
        title={<span style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937' }}>
          {contentForm.getFieldValue("content_link") ? "Update Content" : "Submit Content"}
        </span>}
        open={submitContentModalVisible}
        onCancel={handleCloseSubmitContentModal}
        footer={null}
        width="100%"
        style={{ maxWidth: '600px' }}
      >
        <Form form={contentForm} onFinish={handleSubmitContent} layout="vertical">
          <Form.Item
            name="content_link"
            label="Content Link"
            rules={[{ required: true, message: "Please provide a content link" }]}
          >
            <StyledInput placeholder="e.g., https://example.com/content" />
          </Form.Item>
          <Form.Item
            name="submission_notes"
            label="Submission Notes (Optional)"
          >
            <StyledTextArea rows={3} placeholder="Any additional notes for the brand" />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <StyledButton
              onClick={handleCloseSubmitContentModal}
              aria-label="Cancel submission"
            >
              Cancel
            </StyledButton>
            <StyledButton
              type="primary"
              primary
              htmlType="submit"
              aria-label={contentForm.getFieldValue("content_link") ? "Update content" : "Submit content"}
            >
              {contentForm.getFieldValue("content_link") ? "Update Content" : "Submit Content"}
            </StyledButton>
          </div>
        </Form>
      </StyledModal>

      <StyledModal
        title={<span style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937' }}>Edit Sponsor Draft</span>}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width="100%"
        style={{ maxWidth: '600px' }}
      >
        <Form form={form} onFinish={handleUpdateDraft} layout="vertical">
          <Form.Item
            name="description"
            label="Brief Description"
            rules={[{ required: true, message: "Please provide a brief description of your post" }]}
            extra="Describe your post in detail (e.g., tone, style, key message)"
            className="draft-description-field"
          >
            <StyledTextArea rows={4} placeholder="e.g., A fun and energetic TikTok Reel showcasing a new skincare routine" />
          </Form.Item>
          <Form.Item
            name="platforms"
            label="Platforms"
            rules={[{ required: true, message: "Please select at least one platform" }]}
            className="platforms-field"
          >
            <Select
              mode="multiple"
              placeholder="Select platforms"
              optionLabelProp="label"
              style={{ borderRadius: '12px' }}
              dropdownStyle={{ borderRadius: '12px' }}
            >
              {platforms.map((platform) => (
                <Option key={platform.name} value={platform.name} label={platform.name}>
                  <PlatformOption>
                    {platform.icon}
                    <span>{platform.name}</span>
                  </PlatformOption>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <div className="content-format-section">
            <Form.Item label="Content Format" required>
              <Row gutter={[16, 16]}>
                {contentFormats.map((format) => (
                  <Col span={8} key={format.type}>
                    <ContentTypeCard
                      hoverable
                      selected={contentFormat === format.type}
                      onClick={() => {
                        setContentFormat(format.type);
                        form.setFieldsValue({ content_format: format.type });
                      }}
                    >
                      <ContentTypeIcon selected={contentFormat === format.type}>
                        {format.icon}
                      </ContentTypeIcon>
                      <ContentTypeTitle selected={contentFormat === format.type}>
                        {format.type}
                      </ContentTypeTitle>
                      <ContentTypeDescription>
                        {format.description}
                      </ContentTypeDescription>
                    </ContentTypeCard>
                  </Col>
                ))}
              </Row>
              <Form.Item name="content_format" hidden rules={[{ required: true, message: "Please select a content format" }]}>
                <Input />
              </Form.Item>
            </Form.Item>
          </div>
          <Form.Item
            name="audience_targets"
            label="Target Audience"
            rules={[{ required: true, message: "Please select at least one target audience" }]}
            className="audience-targets-field"
          >
            <StyledSelect
              mode="multiple"
              placeholder="Select target audiences"
              optionLabelProp="label"
              maxTagCount={3}
              maxTagTextLength={20}
            >
              {audienceTargets.map((target) => (
                <Option key={target} value={target} label={target}>
                  <AudienceOption>
                    <div className="audience-icon">
                      {audienceIcons[target]}
                    </div>
                    <span className="audience-label">{target}</span>
                  </AudienceOption>
                </Option>
              ))}
            </StyledSelect>
          </Form.Item>
          <Form.Item
            name="topics"
            label="Topics"
            rules={[{ required: true, message: "Please select at least one topic" }]}
            className="topics-field"
          >
            <StyledSelect
              mode="multiple"
              placeholder="Select topics"
              optionLabelProp="label"
              maxTagCount={3}
              maxTagTextLength={20}
            >
              {topics.map((topic) => (
                <Option key={topic} value={topic} label={topic}>
                  <TopicOption>
                    <div className="topic-icon">
                      {topicIcons[topic]}
                    </div>
                    <span className="topic-label">{topic}</span>
                  </TopicOption>
                </Option>
              ))}
            </StyledSelect>
          </Form.Item>
          <Form.Item
            name="gifting_invite_required"
            label="Gifting/Invite Required?"
            valuePropName="checked"
            extra="Do you require gifting or an invite (e.g., product sample, event access)?"
          >
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>
          <Form.Item
            name="projected_views"
            label="Projected Views"
            rules={[{ required: true, message: "Please select a projected views bracket" }]}
            extra="Estimate the potential views of your post"
            className="projected-views-field"
          >
            <Select placeholder="Select a views bracket" style={{ borderRadius: '12px' }}>
              {viewBrackets.map((bracket) => (
                <Option key={bracket} value={bracket}>{bracket}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="min_bid"
            label="Minimum Bid"
            extra="Set the minimum amount you're willing to accept"
            className="min-bid-field"
          >
            <StyledInput type="number" min="0" step="1" placeholder="e.g., 100" />
          </Form.Item>
          <Form.Item
            name="currency"
            label="Currency"
            extra="Select the currency for your bid"
          >
            <CurrencySelector 
              showLabel={false}
              size="large"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            name="bidding_deadline"
            label="Bidding Deadline"
            rules={[{ required: true, message: "Please set a bidding deadline" }]}
            extra="Set the deadline for brands to submit bids"
            className="bidding-deadline-field"
          >
            <DatePicker
              format="YYYY-MM-DD"
              disabledDate={(current) => current && current < moment().startOf('day')}
              style={{ borderRadius: '12px', width: '100%' }}
            />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
            <StyledButton
              onClick={() => setEditModalVisible(false)}
              aria-label="Cancel edit"
            >
              Cancel
            </StyledButton>
            <StyledButton
              type="primary"
              primary
              htmlType="submit"
              aria-label="Update draft"
            >
              Update Draft
            </StyledButton>
          </div>
        </Form>
      </StyledModal>

      <StyledModal
        title={<span style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937' }}>Create New Sponsor Draft</span>}
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width="100%"
        style={{ maxWidth: '600px' }}
      >
        <DraftModalBody>
          <Form 
            form={createForm} 
            onFinish={handleCreateDraft} 
            layout="vertical" 
            encType="multipart/form-data"
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <DraftFormSection>
              <DraftFormLabel
                name="snippet"
                label={<Tooltip title="Upload a short preview of your content to help brands understand your vision">Video Snippet (Optional, max 15s)</Tooltip>}
                valuePropName="file"
                extra="Upload a short teaser of your draft (under 5MB)"
              >
                <Upload
                  beforeUpload={(file) => {
                    if (file.size > 5 * 1024 * 1024) {
                      message.error("Snippet must be under 5MB.");
                      return Upload.LIST_IGNORE;
                    }
                    return false; // Prevent automatic upload
                  }}
                  onChange={({ file }) => {
                    if (file.status !== "removed") {
                      createForm.setFieldsValue({ snippet: file.originFileObj });
                    } else {
                      createForm.setFieldsValue({ snippet: null });
                    }
                  }}
                  maxCount={1}
                  accept="video/*"
                  listType="picture"
                  style={{ borderRadius: '12px' }}
                >
                  <DraftSubmitButton icon={<UploadOutlined />}>Upload Snippet</DraftSubmitButton>
                </Upload>
              </DraftFormLabel>
            </DraftFormSection>
            <DraftFormSection>
              <DraftFormLabel
                name="description"
                label={<Tooltip title="Provide a detailed description of your content idea, including tone, style, and key message">Brief Description</Tooltip>}
                rules={[{ required: true, message: "Please provide a brief description of your post" }]}
                extra="Describe your post in detail (e.g., tone, style, key message)"
              >
                <StyledTextArea rows={4} placeholder="e.g., A fun and energetic TikTok Reel showcasing a new skincare routine" />
              </DraftFormLabel>
            </DraftFormSection>
            <DraftFormSection>
              <DraftFormLabel
                name="platforms"
                label={<Tooltip title="Select the social media platforms where you'll post this content">Platforms</Tooltip>}
                rules={[{ required: true, message: "Please select at least one platform" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select platforms"
                  optionLabelProp="label"
                  style={{ borderRadius: '12px' }}
                  dropdownStyle={{ borderRadius: '12px' }}
                >
                  {platforms.map((platform) => (
                    <Option key={platform.name} value={platform.name} label={platform.name}>
                      <PlatformOption>
                        {platform.icon}
                        <span>{platform.name}</span>
                      </PlatformOption>
                    </Option>
                  ))}
                </Select>
              </DraftFormLabel>
            </DraftFormSection>
            <DraftFormSection>
              <Form.Item label={<Tooltip title="Choose the type of content you'll create (e.g., Reels, Stories, Live)">Content Format</Tooltip>} required>
                <Row gutter={[16, 16]}>
                  {contentFormats.map((format) => (
                    <Col xs={12} sm={12} md={8} key={format.type}>
                      <ContentTypeCardRefined
                        hoverable
                        selected={contentForm?.getFieldValue('content_format') === format.type}
                        onClick={() => {
                          setContentFormat(format.type);
                          createForm.setFieldsValue({ content_format: format.type });
                        }}
                      >
                        <ContentTypeIcon selected={contentForm?.getFieldValue('content_format') === format.type}>
                          {format.icon}
                        </ContentTypeIcon>
                        <ContentTypeTitleRefined selected={contentForm?.getFieldValue('content_format') === format.type}>
                          {format.type}
                        </ContentTypeTitleRefined>
                        <ContentTypeDescription>
                          {format.description}
                        </ContentTypeDescription>
                      </ContentTypeCardRefined>
                    </Col>
                  ))}
                </Row>
                <Form.Item name="content_format" hidden rules={[{ required: true, message: "Please select a content format" }]}> <Input /> </Form.Item>
              </Form.Item>
            </DraftFormSection>
            <DraftFormSection>
              <DraftFormLabel
                name="audience_targets"
                label={<Tooltip title="Define your target audience to help brands understand who will see this content">Target Audience</Tooltip>}
                rules={[{ required: true, message: "Please select at least one target audience" }]}
              >
                <StyledSelect
                  mode="multiple"
                  placeholder="Select target audiences"
                  optionLabelProp="label"
                  maxTagCount={3}
                  maxTagTextLength={20}
                >
                  {audienceTargets.map((target) => (
                    <Option key={target} value={target} label={target}>
                      <AudienceOption>
                        <div className="audience-icon">
                          {audienceIcons[target]}
                        </div>
                        <span className="audience-label">{target}</span>
                      </AudienceOption>
                    </Option>
                  ))}
                </StyledSelect>
              </DraftFormLabel>
            </DraftFormSection>
            <DraftFormSection>
              <DraftFormLabel
                name="topics"
                label={<Tooltip title="Select relevant topics to help brands find your content opportunity">Topics</Tooltip>}
                rules={[{ required: true, message: "Please select at least one topic" }]}
              >
                <StyledSelect
                  mode="multiple"
                  placeholder="Select topics"
                  optionLabelProp="label"
                  maxTagCount={3}
                  maxTagTextLength={20}
                >
                  {topics.map((topic) => (
                    <Option key={topic} value={topic} label={topic}>
                      <TopicOption>
                        <div className="topic-icon">
                          {topicIcons[topic]}
                        </div>
                        <span className="topic-label">{topic}</span>
                      </TopicOption>
                    </Option>
                  ))}
                </StyledSelect>
              </DraftFormLabel>
            </DraftFormSection>
            <DraftFormSection>
              <DraftFormLabel
                name="gifting_invite_required"
                label={<Tooltip title="Indicate if you need product samples or event access for this content">Gifting/Invite Required?</Tooltip>}
                valuePropName="checked"
                extra="Do you require gifting or an invite (e.g., product sample, event access)?"
              >
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </DraftFormLabel>
            </DraftFormSection>
            <DraftFormSection>
              <DraftFormLabel
                name="projected_views"
                label={<Tooltip title="Estimate how many views your content might receive based on your past performance">Projected Views</Tooltip>}
                rules={[{ required: true, message: "Please select a projected views bracket" }]}
                extra="Estimate the potential views of your post"
              >
                <Select placeholder="Select a views bracket" style={{ borderRadius: '12px' }}>
                  {viewBrackets.map((bracket) => (
                    <Option key={bracket} value={bracket}>{bracket}</Option>
                  ))}
                </Select>
              </DraftFormLabel>
            </DraftFormSection>
            <DraftFormSection>
              <DraftFormLabel
                name="min_bid"
                label={<Tooltip title="Set the minimum amount you're willing to accept for this content">Minimum Bid</Tooltip>}
                extra="Set the minimum amount you're willing to accept"
              >
                <StyledInput type="number" min="0" step="1" placeholder="e.g., 100" />
              </DraftFormLabel>
            </DraftFormSection>
            <DraftFormSection>
              <DraftFormLabel
                name="bidding_deadline"
                label={<Tooltip title="Set a deadline for brands to submit their bids">Bidding Deadline</Tooltip>}
                rules={[{ required: true, message: "Please set a bidding deadline" }]}
                extra="Set the deadline for brands to submit bids"
              >
                <DatePicker
                  format="YYYY-MM-DD"
                  disabledDate={(current) => current && current < moment().startOf('day')}
                  style={{ borderRadius: '12px', width: '100%' }}
                />
              </DraftFormLabel>
            </DraftFormSection>
            <DraftSubmitButton
              type="primary"
              htmlType="submit"
              aria-label="Create draft"
            >
              Create Draft
            </DraftSubmitButton>
          </Form>
        </DraftModalBody>
      </StyledModal>
    </Container>
  );
};

export default SponsorOffers;