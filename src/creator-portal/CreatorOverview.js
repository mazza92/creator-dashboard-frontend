import React, { useState, useEffect } from "react";
import { Card, Typography, Button, Row, Col, Spin, Statistic, Space, Modal, Input, Form, Upload, message, Select, Switch, DatePicker, Table, Tag, Popconfirm } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UploadOutlined, CopyOutlined } from "@ant-design/icons";
import CurrencySelector from '../components/CurrencySelector';
import { 
  FiImage, 
  FiCamera, 
  FiVideo, 
  FiFilm,
  FiTrendingUp,
  FiFileText,
  FiPlus,
  FiUser,
  // eslint-disable-next-line no-unused-vars
  FiUsers,
  // eslint-disable-next-line no-unused-vars
  FiBriefcase,
  // eslint-disable-next-line no-unused-vars
  FiGift,
  FiCheckCircle,
  FiXCircle
} from "react-icons/fi";
import { 
  RiCalendarCheckLine,
  RiVolumeUpLine
} from 'react-icons/ri';
import { 
  FaInstagram, 
  FaTiktok, 
  FaYoutube, 
  FaFacebookF, 
  FaTwitter, 
  FaLinkedinIn, 
  FaSnapchatGhost, 
  FaPinterestP, 
  FaTwitch,
  FaBaby,
  FaUserTie,
  // eslint-disable-next-line no-unused-vars
  FaBriefcase,
  FaGraduationCap,
  FaRunning,
  FaTshirt,
  FaLaptop,
  FaUtensils,
  FaPlane,
  FaDog,
  FaTools,
  FaMusic,
  FaBook,
  FaLeaf,
  FaGem,
  FaShoppingCart,
  FaHeartbeat,
  FaPalette,
  FaCar,
  FaHome,
  FaPaw,
  FaChartLine,
  FaLaughSquint,
  FaNewspaper,
  FaFilm,
  FaPaintBrush,
  FaFlask,
  FaGamepad,
  FaTv,
  FaFutbol,
  FaCamera
} from 'react-icons/fa';
import { MdOutlineLiveTv, MdOutlineAudiotrack, MdFamilyRestroom } from "react-icons/md";
import { GiLipstick } from "react-icons/gi";
import axios from "axios";
import moment from "moment";
import styled from "styled-components";
import { motion } from "framer-motion";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CardHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  @media (min-width: 576px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const CardTitle = styled(Title)`
  &.ant-typography {
    color: #1f2937;
    margin: 0;
    font-size: 18px;
    width: 100%;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    white-space: normal !important;

    @media (min-width: 576px) {
      font-size: 24px;
      width: auto;
      flex: 1;
      min-width: 0;
    }
  }
`;

const CardHeaderLink = styled(Link)`
  align-self: flex-start;

  @media (min-width: 576px) {
    align-self: center;
  }
`;

const QuickLinksSection = styled.div`
  margin-bottom: 32px;
  @media (max-width: 575px) {
    margin-bottom: 24px;
  }
`;

const Container = styled.div`
  padding: 24px;
  background: #f9fafb;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  max-width: 1440px;
  margin: 0 auto;
  @media (max-width: 600px) {
    padding: 10px 2px;
  }
`;

const HeaderSection = styled.div`
  margin-bottom: 32px;
  @media (max-width: 575px) {
    margin-bottom: 24px;
  }
`;

const HeaderTitle = styled(Title)`
  font-size: 32px !important;
  color: #1f2937 !important;
  margin-bottom: 16px !important;
  line-height: 1.2 !important;
  @media (max-width: 768px) {
    font-size: 28px !important;
  }
  @media (max-width: 575px) {
    font-size: 24px !important;
    margin-bottom: 12px !important;
  }
`;

const HeaderSubtitle = styled(Text)`
  color: #4b5563;
  font-size: 18px;
  line-height: 1.5;
  @media (max-width: 768px) {
    font-size: 16px;
  }
  @media (max-width: 575px) {
    font-size: 14px;
    line-height: 1.4;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  @media (max-width: 575px) {
    flex-direction: column;
    width: 100%;
  }
`;

const StatsSection = styled.div`
  margin-bottom: 32px;
  @media (max-width: 575px) {
    margin-bottom: 24px;
  }
`;

const StatCard = styled(Card)`
  text-align: center;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #26A69A, #4DB6AC);
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    transform: translateY(-4px);
    border-color: #26A69A;
    box-shadow: 0 8px 24px rgba(38, 166, 154, 0.2);
  }
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
  @media (max-width: 575px) {
    min-height: 120px;
    .ant-statistic-content {
      font-size: 20px;
    }
  }
`;

const QuickLinksCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background: #ffffff;
  transition: transform 0.3s ease;
  overflow: hidden;
  width: 100%;

  .ant-card-body {
    overflow: hidden;
    padding: 16px;

    @media (min-width: 576px) {
      padding: 24px;
    }
  }
  padding: 16px;
  max-width: 100%;
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;

  .ant-card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0 12px 0;
    min-height: 36px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .ant-card-head-title {
    font-size: 24px;
    padding: 0;
    flex: 1;
    min-width: 200px;
    max-width: calc(100% - 120px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 16px;
  }

  .ant-card-extra {
    padding: 0;
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 80px;
    text-align: right;
  }

  .ant-card-body {
    padding: 16px 0;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 575px) {
    padding: 12px;
    
    .ant-card-head {
      gap: 8px;
    }

    .ant-card-head-title {
      font-size: 20px;
      min-width: 150px;
      max-width: calc(100% - 100px);
      margin-right: 12px;
    }

    .ant-card-extra {
      min-width: 70px;
    }

    .ant-card-extra .ant-btn {
      font-size: 12px;
      padding: 4px 8px;
    }

    .ant-card-body {
      padding: 12px 0;
    }
  }
`;

const MinimalCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background: #ffffff;
  padding: 6px;
  margin-bottom: 8px;
  max-width: 100%;
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  .ant-card-body {
    overflow-x: hidden;
    max-width: 100%;
    padding: 0;
  }
  @media (max-width: 575px) {
    padding: 4px;
  }
`;

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    font-size: 14px;
    padding: 12px 8px;
    background: #f9fafb;
  }
  .ant-table-tbody > tr > td {
    font-size: 13px;
    padding: 12px 8px;
  }
  @media (max-width: 768px) {
    display: none;
  }
`;

const BidCardContainer = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: block;
  }
`;

const BidCard = styled.div`
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }

  .bid-field {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f1f5f9;

    &:last-child {
      border-bottom: none;
    }
  }

  .bid-field-label {
    font-weight: 500;
    color: #64748b;
    font-size: 13px;
  }

  .bid-field-value {
    color: #1e293b;
    font-size: 13px;
    text-align: right;
    max-width: 60%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bid-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;
    width: 100%;

    .ant-btn {
      flex: 1;
      height: 36px;
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0 8px;
    }
  }

  @media (max-width: 575px) {
    padding: 12px;
    
    .bid-field {
      padding: 6px 0;
    }

    .bid-field-label,
    .bid-field-value {
      font-size: 12px;
    }

    .bid-actions {
      margin-top: 8px;
      padding-top: 8px;
      flex-wrap: nowrap;

      .ant-btn {
        height: 32px;
        font-size: 12px;
        min-width: 0;
        padding: 0 4px;
      }
    }
  }
`;

const SponsorDraftsSection = styled.div`
  margin-top: 32px;
  @media (max-width: 575px) {
    margin-top: 24px;
  }
`;

const DraftCard = styled(MinimalCard)`
  margin-bottom: 16px;
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }

  @media (max-width: 575px) {
    margin-bottom: 12px;
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
  margin-bottom: 16px;
  .ant-card-body {
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  @media (max-width: 600px) {
    min-height: 120px;
    padding: 16px 8px;
    margin-bottom: 18px;
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
  font-size: 17px;
  color: ${props => props.selected ? '#26A69A' : '#1f2937'};
  margin-bottom: 4px;
  @media (max-width: 600px) {
    font-size: 16px;
  }
`;

const ContentTypeDescription = styled(Text)`
  font-size: 12px;
  color: #6b7280;
  text-align: center;
  line-height: 1.4;
`;

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

const PlatformOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  .platform-icon {
    font-size: 20px;
    display: inline-flex;
    align-items: center;
  }
  @media (max-width: 575px) {
    .platform-icon {
      font-size: 16px;
    }
  }
`;

const StyledButton = styled(Button)`
  border-radius: 24px;
  padding: 10px 24px;
  background: ${props => props.type === 'primary' ? 'linear-gradient(135deg, #26A69A, #4DB6AC)' : '#fff'};
  border: ${props => props.type === 'primary' ? 'none' : '1px solid #d1d5db'};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.type === 'primary' ? 'linear-gradient(135deg, #2BBBAD, #4DB6AC)' : '#f9fafb'};
  }
  color: ${props => props.type === 'primary' ? '#fff' : '#4b5563'};
  font-weight: 600;
  font-size: 14px;
  height: 40px;
  &:hover {
    background: ${props => props.type === 'primary' ? 'linear-gradient(135deg, #4DB6AC, #26A69A)' : '#e6f7ff'};
    color: ${props => props.type === 'primary' ? '#fff' : '#26A69A'};
    border-color: ${props => props.type === 'primary' ? 'none' : '#26A69A'};
  }
  @media (max-width: 575px) {
    font-size: 12px;
    padding: 8px 16px;
    height: 36px;
  }
`;

const StyledInput = styled(Input)`
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 14px;
  &:focus, &:hover {
    border-color: #26A69A;
    box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.2);
  }
  @media (max-width: 575px) {
    font-size: 12px;
    padding: 8px 12px;
  }
`;

const StyledTextArea = styled(TextArea)`
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 14px;
  &:focus, &:hover {
    border-color: #26A69A;
    box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.2);
  }
  @media (max-width: 575px) {
    font-size: 12px;
    padding: 8px 12px;
  }
`;

const StyledSelect = styled(Select)`
  .ant-select-selector {
    border-radius: 12px !important;
    padding: 8px 16px !important;
    font-size: 14px !important;
    max-width: 100%;
    overflow: hidden;
  }
  &:focus, &:hover {
    .ant-select-selector {
      border-color: #26A69A !important;
      box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.2) !important;
    }
  }
  @media (max-width: 575px) {
    .ant-select-selector {
      font-size: 12px !important;
      padding: 6px 12px !important;
    }
  }
`;

const StyledDatePicker = styled(DatePicker)`
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 14px;
  width: 100%;
  &:focus, &:hover {
    border-color: #26A69A;
    box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.2);
  }
  @media (max-width: 575px) {
    font-size: 12px;
    padding: 8px 12px;
  }
`;

// eslint-disable-next-line no-unused-vars
const ButtonGroup = styled(Space)`
  @media (max-width: 575px) {
    flex-direction: column;
    width: 100%;
    gap: 12px;
  }
`;

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const buttonVariants = {
  rest: { opacity: 1 },
  hover: { opacity: 1 },
};

// eslint-disable-next-line no-unused-vars
const modalVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const OnboardingChecklist = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;

  .checklist-title {
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 16px;
  }

  .checklist-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 8px;
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
      background: #f9fafb;
    }

    &.highlight {
      background: #f0fdfa;
      border: 2px solid #26A69A;
    }

    .checklist-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      color: #26A69A;
    }

    .checklist-content {
      flex: 1;

      .checklist-label {
        font-weight: 500;
        color: #1f2937;
        margin-bottom: 4px;
      }

      .checklist-description {
        font-size: 13px;
        color: #6b7280;
      }
    }

    .checklist-status {
      margin-left: 12px;
      color: #26A69A;
      font-weight: 500;
    }
  }
`;
const API_URL = process.env.REACT_APP_BACKEND_URL;

// Add styled components for the vibrant modal (define at the top, after imports)
const ModalHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #10b981 0%, #4ade80 100%);
  border-radius: 16px 16px 0 0;
  padding: 32px 16px 20px 16px;
  margin: -24px -24px 0 -24px;
`;
const ModalIcon = styled.div`
  background: #fff;
  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(16,185,129,0.10);
  font-size: 36px;
  color: #10b981;
`;
const ModalTitle = styled.h2`
  color: #fff;
  font-size: 1.7rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  text-align: center;
`;
const ModalDesc = styled.p`
  color: #e0f7fa;
  font-size: 1.1rem;
  margin: 0 0 8px 0;
  text-align: center;
`;
const VibrantCopyInput = styled(Input)`
  border-radius: 12px;
  font-size: 1.1rem;
  margin-bottom: 12px;
  border: 2px solid #10b981;
  background: #f0fdfa;
  &:focus, &:hover {
    border-color: #26A69A;
    box-shadow: 0 0 0 2px rgba(16,185,129,0.15);
  }
`;
const VibrantCopyButton = styled(Button)`
  background: linear-gradient(90deg, #10b981 0%, #4ade80 100%);
  color: #fff;
  border: none;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(16,185,129,0.10);
  &:hover, &:focus {
    background: linear-gradient(90deg, #22d3ee 0%, #10b981 100%);
    color: #fff;
  }
`;
const ModalBody = styled.div`
  padding: 16px 0 0 0;
  text-align: center;
`;

// Add/replace styled components for vibrant redesign
const MinimalChecklistCard = styled(OnboardingChecklist)`
  background: #fff;
  color: #1f2937;
  box-shadow: 0 4px 24px rgba(16,185,129,0.08);
  border-radius: 16px;
  border: none;
  margin-bottom: 32px;
  padding: 28px 18px 18px 18px;
  .checklist-title {
    color: #10b981;
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .checklist-item {
    background: #f9fafb;
    color: #1f2937;
    border: none;
    margin-bottom: 18px;
    padding: 18px 10px;
    border-radius: 10px;
    .checklist-label { color: #1f2937; font-weight: 600; font-size: 17px; }
    .checklist-description { font-size: 15px; line-height: 1.5; }
    .checklist-status {
      background: linear-gradient(90deg, #10b981 0%, #4ade80 100%);
      color: #fff;
      border-radius: 8px;
      padding: 4px 14px;
      font-size: 14px;
      font-weight: 700;
      margin-left: 10px;
      box-shadow: 0 1px 4px rgba(16,185,129,0.10);
    }
    &.highlight {
      background: #f0fdfa;
      border: 2px solid #10b981;
    }
  }
  @media (max-width: 600px) {
    padding: 18px 6px 10px 6px;
    .checklist-title { font-size: 19px; margin-bottom: 18px; }
    .checklist-item { padding: 14px 4px; margin-bottom: 14px; }
    .checklist-label { font-size: 15px; }
    .checklist-description { font-size: 13.5px; }
    .checklist-status { font-size: 13px; padding: 3px 10px; }
  }
`;
const ChecklistCelebration = styled.div`
  font-size: 2.2rem;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const MinimalStatCard = styled(StatCard)`
  background: #fff;
  color: #1f2937;
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 24px rgba(16,185,129,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
  .ant-statistic-title { color: #6b7280; font-size: 15px; }
  .ant-statistic-content { color: #1f2937; font-size: 28px; font-weight: 800; }
  @media (max-width: 600px) {
    margin-bottom: 14px;
    .ant-statistic-title { font-size: 14px; }
    .ant-statistic-content { font-size: 22px; }
  }
`;
const StatIconCircle = styled.div`
  background: linear-gradient(90deg, #10b981 0%, #4ade80 100%);
  color: #fff;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-right: 14px;
`;
const MinimalActionButton = styled(StyledButton)`
  background: linear-gradient(90deg, #10b981 0%, #4ade80 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(16,185,129,0.10);
  min-height: 48px;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    font-size: 15px;
    min-height: 44px;
    padding: 10px 20px;
  }
  
  @media (max-width: 575px) {
    font-size: 14px;
    min-height: 40px;
    padding: 8px 16px;
    width: 100%;
    max-width: 300px;
  }
  
  &:hover, &:focus {
    background: linear-gradient(90deg, #22d3ee 0%, #10b981 100%);
    color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16,185,129,0.20);
  }
`;
const MinimalQuickLinksCard = styled(QuickLinksCard)`
  background: #fff;
  border: none;
  box-shadow: 0 2px 8px rgba(16,185,129,0.08);
  border-radius: 16px;
  .ant-card-head-title { color: #10b981; font-weight: 700; }
`;
const MinimalQuickLink = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border-left: 5px solid #10b981;
  border-radius: 10px;
  padding: 18px 20px;
  margin-bottom: 14px;
  box-shadow: 0 1px 4px rgba(16,185,129,0.06);
  font-weight: 600;
  color: #1f2937;
  font-size: 17px;
  transition: background 0.2s;
  width: 100%;
  &:hover {
    background: #f0fdfa;
    color: #10b981;
  }
  @media (max-width: 600px) {
    padding: 14px 8px;
    font-size: 15px;
    margin-bottom: 10px;
  }
`;

// Add/replace styled components for the refined modal
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

const CreatorOverview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeCampaigns: 0,
    pendingActions: 0,
  });
  const [creatorId, setCreatorId] = useState(null);
  const [isDraftModalVisible, setIsDraftModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [contentFormat, setContentFormat] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sponsorDrafts, setSponsorDrafts] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileUrl, setProfileUrl] = useState('');
  // Add state for public profile URL
  const [publicProfileUrl, setPublicProfileUrl] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [publicProfileUsername, setPublicProfileUsername] = useState('');
  // Add state for checking if creator has ad slots
  const [hasAdSlots, setHasAdSlots] = useState(false);
  const [checkingAdSlots, setCheckingAdSlots] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('🔍 Fetching overview data...');
        const [statsResponse, profileResponse, draftsResponse, adSlotsResponse] = await Promise.all([
          axios.get(`${API_URL}/creators/me/stats`, { withCredentials: true }),
          axios.get(`${API_URL}/profile`, { withCredentials: true }),
          axios.get(`${API_URL}/my-sponsor-drafts`, { withCredentials: true }),
          axios.get(`${API_URL}/creator/has-ad-slots`, { withCredentials: true }),
        ]);
  
        console.log('🔍 Stats response:', statsResponse.data);
        console.log('🔍 Profile response:', profileResponse.data);
        console.log('🔍 Drafts response:', draftsResponse.data);
        console.log('🔍 Ad slots response:', adSlotsResponse.data);
  
        // Apply platform fees (15%) to calculate net earnings
        const grossEarnings = statsResponse.data.total_earnings || 0;
        const platformFee = grossEarnings * 0.15; // 15% platform fee
        const netEarnings = grossEarnings - platformFee;
        
        setStats({
          totalEarnings: netEarnings, // Show net earnings after fees
          activeCampaigns: statsResponse.data.active_campaigns || 0,
          pendingActions: statsResponse.data.pending_actions || 0,
        });
  
        if (profileResponse.data.user_role === "creator") {
          setCreatorId(profileResponse.data.creator_id);
          setPublicProfileUsername(profileResponse.data.username);
          const url = profileResponse.data.username
            ? `https://newcollab.co/c/${profileResponse.data.username}`
            : `https://newcollab.co/creator/profile/${profileResponse.data.creator_id}`;
          setPublicProfileUrl(url);
        }
  
        const filteredDrafts = draftsResponse.data
          .filter((draft) => draft.bids.some((bid) => bid.status === "Pending"))
          .map((draft) => ({
            draft_id: draft.id,
            description: draft.description,
            bids: draft.bids
              .filter((bid) => bid.status === "Pending")
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 3)
              .map((bid) => {
                // Apply platform fees (15%) to calculate net earnings
                const grossAmount = parseFloat(bid.bid_amount) || 0;
                const platformFee = grossAmount * 0.15; // 15% platform fee
                const netAmount = grossAmount - platformFee;
                
                return {
                  bid_id: bid.bid_id,
                  brand_id: bid.brand_id,
                  brand_name: bid.brand_name,
                  amount: netAmount.toFixed(2), // Show net amount after fees
                  status: bid.status.toLowerCase(),
                  created_at: bid.created_at
                };
              }),
          }));
        setSponsorDrafts(filteredDrafts);

        // Set ad slots status
        setHasAdSlots(adSlotsResponse.data.has_ad_slots);
        setCheckingAdSlots(false);

        // Show the create draft modal automatically for new creators with no drafts
        if (filteredDrafts.length === 0) {
          setIsDraftModalVisible(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to fetch overview data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const openDraftModal = queryParams.get("openDraftModal") === "true";
    if (openDraftModal) {
      setIsDraftModalVisible(true);
      navigate('/creator/dashboard/overview', { replace: true });
    }
  }, [location, navigate]);
  
  const handleSubmitDraft = async (values) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("description", values.description);
      formData.append("platforms", JSON.stringify(values.platforms || []));
      formData.append("min_bid", values.min_bid || "");
      formData.append("audience_targets", JSON.stringify(values.audience_targets || []));
      formData.append("content_format", values.content_format || "");
      formData.append("topics", JSON.stringify(values.topics || []));
      formData.append("gifting_invite_required", values.gifting_invite_required ? "Yes" : "No");
      formData.append("projected_views", values.projected_views || "");
      formData.append("bidding_deadline", values.bidding_deadline ? values.bidding_deadline.format("YYYY-MM-DD") : "");
      if (values.snippet?.file) {
        formData.append("snippet", values.snippet.file);
      }
  
      console.log('🔍 Submitting draft to:', `${API_URL}/sponsor-draft`);
      await axios.post(`${API_URL}/sponsor-draft`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      message.success("Draft submitted successfully!");
      setIsDraftModalVisible(false);
      form.resetFields();
      setContentFormat(null);

      // Fetch profile to get username/creatorId for public profile URL
      try {
        const profileRes = await axios.get(`${API_URL}/profile`, { withCredentials: true });
        const username = profileRes.data.username;
        const creatorId = profileRes.data.creator_id;
        const url = username
          ? `https://newcollab.co/c/${username}`
          : `https://newcollab.co/creator/profile/${creatorId}`;
        setProfileUrl(url);
        setShowProfileModal(true);
      } catch (e) {
        setProfileUrl('');
        setShowProfileModal(false);
      }
  
      console.log('🔍 Refetching drafts...');
      const draftsResponse = await axios.get(`${API_URL}/my-sponsor-drafts`, { withCredentials: true });
      console.log('🔍 Drafts response:', draftsResponse.data);
      setSponsorDrafts(
        draftsResponse.data
          .filter((draft) => draft.bids.some((bid) => bid.status === "Pending"))
          .map((draft) => ({
            draft_id: draft.id,
            description: draft.description,
            bids: draft.bids
              .filter((bid) => bid.status === "Pending")
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 3)
              .map((bid) => {
                // Apply platform fees (15%) to calculate net earnings
                const grossAmount = parseFloat(bid.bid_amount) || 0;
                const platformFee = grossAmount * 0.15; // 15% platform fee
                const netAmount = grossAmount - platformFee;
                
                return {
                  bid_id: bid.bid_id,
                  brand_id: bid.brand_id,
                  brand_name: bid.brand_name,
                  amount: netAmount.toFixed(2), // Show net amount after fees
                  status: bid.status.toLowerCase(),
                  created_at: bid.created_at
                };
              }),
          }))
      );
    } catch (error) {
      console.error('Error submitting draft:', error);
      message.error("Failed to submit draft: " + (error.response?.data?.error || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBidAction = async (bidId, action) => {
    setActionLoading(true);
    try {
      console.log('🔍 Processing bid action:', { bidId, action });
      await axios.post(
        `${API_URL}/sponsor-bids/${bidId}/action`,
        { action },
        { withCredentials: true }
      );
  
      console.log('🔍 Refetching drafts after bid action...');
      const draftsResponse = await axios.get(`${API_URL}/my-sponsor-drafts`, { withCredentials: true });
      console.log('🔍 Drafts response:', draftsResponse.data);
      setSponsorDrafts(
        draftsResponse.data
          .filter((draft) => draft.bids.some((bid) => bid.status === "Pending"))
          .map((draft) => ({
            draft_id: draft.id,
            description: draft.description,
            bids: draft.bids
              .filter((bid) => bid.status === "Pending")
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 3)
              .map((bid) => {
                // Apply platform fees (15%) to calculate net earnings
                const grossAmount = parseFloat(bid.bid_amount) || 0;
                const platformFee = grossAmount * 0.15; // 15% platform fee
                const netAmount = grossAmount - platformFee;
                
                return {
                  bid_id: bid.bid_id,
                  brand_id: bid.brand_id,
                  brand_name: bid.brand_name,
                  amount: netAmount.toFixed(2), // Show net amount after fees
                  status: bid.status.toLowerCase(),
                  created_at: bid.created_at
                };
              }),
          }))
      );
  
      message.success(`Bid ${action}ed successfully!`);
    } catch (error) {
      console.error('Error processing bid action:', error);
      const errorMsg = error.response?.data?.error || "Unknown error";
      if (errorMsg.includes("Unauthorized")) {
        message.error("You are not authorized to perform this action.");
      } else if (errorMsg.includes("not in a pending state")) {
        message.error("This bid cannot be modified as it is no longer pending.");
      } else {
        message.error("Failed to process bid action: " + errorMsg);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const contentFormats = [
    { 
      type: "Reels", 
      icon: <FiVideo style={{ fontSize: '28px', color: '#26A69A' }} />, 
      emoji: "🎬",
      color: '#26A69A',
      description: 'Long form vertical videos'
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
    { name: "Instagram", icon: <FaInstagram style={{ color: '#E1306C' }} />, ariaLabel: "Select Instagram platform" },
    { name: "TikTok", icon: <FaTiktok style={{ color: '#000000' }} />, ariaLabel: "Select TikTok platform" },
    { name: "YouTube", icon: <FaYoutube style={{ color: '#FF0000' }} />, ariaLabel: "Select YouTube platform" },
    { name: "Facebook", icon: <FaFacebookF style={{ color: '#1877F2' }} />, ariaLabel: "Select Facebook platform" },
    { name: "Twitter", icon: <FaTwitter style={{ color: '#1DA1F2' }} />, ariaLabel: "Select Twitter platform" },
    { name: "LinkedIn", icon: <FaLinkedinIn style={{ color: '#0A66C2' }} />, ariaLabel: "Select LinkedIn platform" },
    { name: "Snapchat", icon: <FaSnapchatGhost style={{ color: '#FFFC00' }} />, ariaLabel: "Select Snapchat platform" },
    { name: "Pinterest", icon: <FaPinterestP style={{ color: '#E60023' }} />, ariaLabel: "Select Pinterest platform" },
    { name: "Twitch", icon: <FaTwitch style={{ color: '#9146FF' }} />, ariaLabel: "Select Twitch platform" },
  ];

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

  // Audience icons mapping
  const audienceIcons = {
    "Gen Z (18-24)": <FaBaby style={{ fontSize: '16px', color: '#26A69A' }} />,
    "Millennials (25-34)": <FaUserTie style={{ fontSize: '16px', color: '#26A69A' }} />,
    "Gen X (35-54)": <FiBriefcase style={{ fontSize: '16px', color: '#26A69A' }} />,
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

  // Topic icons mapping
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

  const handleChecklistClick = (action) => {
    switch (action) {
      case 'payments':
        navigate('/creator/dashboard/payments');
        break;
      case 'content-bids':
        navigate('/creator/first-ad-slot');
        break;
      case 'sponsor-offers':
        navigate('/creator/dashboard/branded-content');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return <Spin size="large" style={{ display: "block", margin: "50px auto" }} />;
  }

  // Show empty state for creators with no ad slots
  if (!checkingAdSlots && !hasAdSlots) {
    return (
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            maxWidth: '600px',
            margin: '0 auto'
          }}
        >
          <div style={{ 
            fontSize: '80px', 
            marginBottom: '32px',
            lineHeight: 1
          }}>🚀</div>
          
          <HeaderTitle level={1} style={{ 
            marginBottom: '16px',
            lineHeight: '1.2'
          }}>
            Ready to start earning?
          </HeaderTitle>
          
          <HeaderSubtitle style={{ 
            marginBottom: '60px', 
            maxWidth: '500px', 
            margin: '0 auto 60px auto',
            lineHeight: '1.5'
          }}>
            Create your first ad slot opportunity to start receiving brand bids and monetizing your content.
          </HeaderSubtitle>
          
          <div style={{ 
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <MinimalActionButton
              type="primary"
              size="large"
              onClick={() => navigate('/creator/first-ad-slot')}
              icon={<FiPlus />}
              style={{ 
                minWidth: '280px',
                height: '48px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              Create My First Ad Slot
            </MinimalActionButton>
          </div>
          
          <div style={{ 
            color: '#6b7280', 
            fontSize: '14px',
            lineHeight: '1.4'
          }}>
            Takes 1 minute
          </div>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container>
      <MinimalChecklistCard>
        <div className="checklist-title">
          <ChecklistCelebration>🚀</ChecklistCelebration>
          Get Started Checklist
        </div>
        <div 
          className="checklist-item highlight"
          onClick={() => handleChecklistClick('payments')}
        >
          <div className="checklist-content">
            <div className="checklist-label">Set Up Payments</div>
            <div className="checklist-description">Connect your Stripe account to start receiving payments from brands</div>
          </div>
          <div className="checklist-status">Required</div>
        </div>
        <div 
          className="checklist-item"
          onClick={() => handleChecklistClick('content-bids')}
        >
          <div className="checklist-content">
            <div className="checklist-label">Create Your New Content Draft</div>
            <div className="checklist-description">Post a content brief to get brands to bid on your content</div>
          </div>
          <div className="checklist-status">Next Step</div>
        </div>
        <div 
          className="checklist-item"
          onClick={() => handleChecklistClick('sponsor-offers')}
        >
          <div className="checklist-content">
            <div className="checklist-label">Check for New Bids</div>
            <div className="checklist-description">Review incoming brand offers in the Content Bids section</div>
          </div>
          <div className="checklist-status">Recommended</div>
        </div>
      </MinimalChecklistCard>

      {publicProfileUrl && (
        <div style={{
          background: '#f0fdfa',
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(16,185,129,0.08)',
          padding: '24px 18px',
          margin: '0 0 32px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 12,
          maxWidth: 600,
          width: '100%',
        }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#10b981', marginBottom: 6 }}>
            Your Public Profile Link
          </div>
          <div style={{ color: '#4b5563', fontSize: 15, marginBottom: 10 }}>
            Share this link in your social bio so brands can directly bid on your offers:
          </div>
          <div style={{ width: '100%', display: 'flex', gap: 8 }}>
            <VibrantCopyInput
              value={publicProfileUrl}
              readOnly
              style={{ flex: 1, marginBottom: 0 }}
            />
            <VibrantCopyButton
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(publicProfileUrl);
                message.success('Link copied!');
              }}
              style={{ minWidth: 90 }}
            >
              Copy
            </VibrantCopyButton>
          </div>
        </div>
      )}

      <HeaderSection>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={12}>
            <HeaderTitle level={2}>Secure meaningful partnerships</HeaderTitle>
            <HeaderSubtitle>
              Create content and partner with brands that resonate with your audience.
            </HeaderSubtitle>
          </Col>
          <Col xs={24} md={12}>
            <ActionButtons>
              <motion.div variants={buttonVariants} initial="rest" whileHover="hover" style={{ flex: 1 }}>
                <MinimalActionButton
                  type="primary"
                  onClick={() => navigate('/creator/first-ad-slot')}
                  aria-label="Create branded content"
                  icon={<FiPlus style={{ fontSize: '16px', marginRight: '8px' }} />}
                  className="publish-content-button"
                  style={{ width: '100%' }}
                >
                  Publish Content Offer
                </MinimalActionButton>
              </motion.div>
            </ActionButtons>
          </Col>
        </Row>
      </HeaderSection>

      <StatsSection className="stats-section">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={24} md={8} style={{ marginBottom: 0 }}>
            <motion.div variants={cardVariants} initial="hidden" animate="visible">
              <MinimalStatCard>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <StatIconCircle><FiTrendingUp /></StatIconCircle>
                  <Statistic
                    title={<span style={{ color: '#6b7280', fontSize: '16px' }}><FiTrendingUp style={{ color: '#1f2937', marginRight: 8, fontSize: '20px' }} /> Net Earnings</span>}
                    value={stats.totalEarnings.toFixed(2)}
                    prefix={require('../utils/currency').getCurrencySymbol()}
                    valueStyle={{ color: '#1f2937', fontSize: '28px', fontWeight: '800' }}
                  />
                </div>
              </MinimalStatCard>
            </motion.div>
          </Col>
          <Col xs={24} sm={24} md={8} style={{ marginBottom: 0 }}>
            <motion.div variants={cardVariants} initial="hidden" animate="visible">
              <MinimalStatCard>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <StatIconCircle><FiBriefcase /></StatIconCircle>
                  <Statistic
                    title={<span style={{ color: '#6b7280', fontSize: '16px' }}><FiBriefcase style={{ color: '#1f2937', marginRight: 8, fontSize: '20px' }} /> Active Campaigns</span>}
                    value={stats.activeCampaigns}
                    valueStyle={{ color: '#1f2937', fontSize: '28px', fontWeight: '800' }}
                  />
                </div>
              </MinimalStatCard>
            </motion.div>
          </Col>
          <Col xs={24} sm={24} md={8} style={{ marginBottom: 0 }}>
            <motion.div variants={cardVariants} initial="hidden" animate="visible">
              <MinimalStatCard>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <StatIconCircle><FiFileText /></StatIconCircle>
                  <Statistic
                    title={<span style={{ color: '#6b7280', fontSize: '16px' }}><FiFileText style={{ color: '#1f2937', marginRight: 8, fontSize: '20px' }} /> Pending Actions</span>}
                    value={stats.pendingActions}
                    valueStyle={{ color: '#1f2937', fontSize: '28px', fontWeight: '800' }}
                  />
                </div>
              </MinimalStatCard>
            </motion.div>
          </Col>
        </Row>
      </StatsSection>

      <QuickLinksSection className="quick-links">
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <MinimalQuickLinksCard title={<Title level={3} style={{ color: '#1f2937', fontSize: '24px', marginBottom: 0 }}>Quick Links</Title>}>
            <Space direction="vertical" size="middle" style={{ width: "100%", overflow: 'hidden' }}>
              <MinimalQuickLink as={Link} to="/creator/dashboard/bookings">
                <motion.div variants={buttonVariants} initial="rest" whileHover="hover">
                  <MinimalActionButton
                    type="primary"
                    block
                    style={{ width: '100%' }}
                    aria-label="Campaigns"
                    icon={<RiCalendarCheckLine style={{ fontSize: '16px', marginRight: '8px' }} />}
                  >
                    Campaigns
                  </MinimalActionButton>
                </motion.div>
              </MinimalQuickLink>
              <MinimalQuickLink as={Link} to="/creator/dashboard/branded-content">
                <motion.div variants={buttonVariants} initial="rest" whileHover="hover">
                  <MinimalActionButton
                    type="primary"
                    block
                    style={{ width: '100%' }}
                    aria-label="Content Bids"
                    icon={<RiVolumeUpLine style={{ fontSize: '16px', marginRight: '8px' }} />}
                  >
                    Content Bids
                  </MinimalActionButton>
                </motion.div>
              </MinimalQuickLink>
              <MinimalQuickLink as={Link} to={creatorId ? `/creator/profile/${creatorId}` : "/creator/dashboard/profile"}>
                <motion.div variants={buttonVariants} initial="rest" whileHover="hover">
                  <MinimalActionButton
                    type="primary"
                    block
                    style={{ width: '100%' }}
                    aria-label="View my profile"
                    icon={<FiUser style={{ fontSize: '16px', marginRight: '8px' }} />}
                  >
                    View My Profile
                  </MinimalActionButton>
                </motion.div>
              </MinimalQuickLink>
            </Space>
          </MinimalQuickLinksCard>
        </motion.div>
      </QuickLinksSection>

      <SponsorDraftsSection className="pending-bids-section">
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <QuickLinksCard
            title={
              <CardHeaderContainer>
                <CardTitle level={3}>Pending Content Bids</CardTitle>
                <CardHeaderLink to="/creator/dashboard/branded-content">
                  <StyledButton type="link" aria-label="View all content bids">
                    View All
                  </StyledButton>
                </CardHeaderLink>
              </CardHeaderContainer>
            }
          >
            {sponsorDrafts.length === 0 ? (
              <Text style={{ color: '#4b5563', fontSize: '14px', display: 'block', textAlign: 'center', padding: '16px' }}>
                No pending content bids. Create a branded content brief to get started!
              </Text>
            ) : (
              <>
                                <Text style={{ color: '#6b7280', fontSize: '12px', display: 'block', marginBottom: '16px', fontStyle: 'italic' }}>
                  * Amounts shown are net earnings after 15% platform fees
                </Text>
                <Row gutter={[16, 16]}>
                  {sponsorDrafts.slice(0, 3).map((draft) => (
                  <Col xs={24} key={draft.draft_id}>
                    <DraftCard>
                      {/* Table for Desktop */}
                      <StyledTable
                        dataSource={draft.bids.map((bid) => ({ ...bid, key: bid.bid_id }))}
                        pagination={false}
                        size="middle"
                        columns={[
                          {
                            title: 'Brand',
                            dataIndex: 'brand_name',
                            key: 'brand_name',
                            width: '35%',
                            render: (text, record) => (
                              <Link to={`/brand/profile/${record.brand_id}`} aria-label={`View profile of ${text || 'brand'}`}>
                                <Text style={{ color: '#26A69A' }}>{text || 'Unknown Brand'}</Text>
                              </Link>
                            ),
                          },
                          {
                            title: 'Net Amount',
                            dataIndex: 'amount',
                            key: 'amount',
                            width: '25%',
                            render: (amount) => <Text>{require('../utils/currency').formatPrice(amount)}</Text>,
                          },
                          {
                            title: 'Status',
                            dataIndex: 'status',
                            key: 'status',
                            width: '20%',
                            render: (status) => (
                              <Tag color="default">
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </Tag>
                            ),
                          },
                          {
                            title: 'Actions',
                            key: 'actions',
                            width: '20%',
                            render: (_, bid) => (
                              <Space size="small">
                                <Popconfirm
                                  title="Are you sure you want to accept this bid?"
                                  onConfirm={() => handleBidAction(bid.bid_id, 'accept')}
                                  okText="Yes"
                                  cancelText="No"
                                >
                                  <StyledButton
                                    size="small"
                                    type="primary"
                                    disabled={actionLoading}
                                    aria-label={`Accept bid from ${bid.brand_name || 'brand'}`}
                                    icon={<FiCheckCircle style={{ fontSize: '14px', marginRight: '4px' }} />}
                                  >
                                    Accept
                                  </StyledButton>
                                </Popconfirm>
                                <Popconfirm
                                  title="Are you sure you want to reject this bid?"
                                  onConfirm={() => handleBidAction(bid.bid_id, 'reject')}
                                  okText="Yes"
                                  cancelText="No"
                                >
                                  <StyledButton
                                    size="small"
                                    disabled={actionLoading}
                                    aria-label={`Reject bid from ${bid.brand_name || 'brand'}`}
                                    icon={<FiXCircle style={{ fontSize: '14px', marginRight: '4px' }} />}
                                  >
                                    Reject
                                  </StyledButton>
                                </Popconfirm>
                              </Space>
                            ),
                          },
                        ]}
                      />
                      {/* Cards for Mobile */}
                      <BidCardContainer>
                        {draft.bids.map((bid) => (
                          <BidCard key={bid.bid_id}>
                            <div className="bid-field">
                              <Text className="bid-field-label">Brand</Text>
                              <Link
                                to={`/brand/profile/${bid.brand_id}`}
                                aria-label={`View profile of ${bid.brand_name || 'brand'}`}
                                className="bid-field-value"
                              >
                                <Text style={{ color: '#26A69A' }}>{bid.brand_name || 'Unknown Brand'}</Text>
                              </Link>
                            </div>
                            <div className="bid-field">
                              <Text className="bid-field-label">Net Amount</Text>
                              <Text className="bid-field-value">{require('../utils/currency').formatPrice(bid.amount)}</Text>
                            </div>
                            <div className="bid-field">
                              <Text className="bid-field-label">Status</Text>
                              <Tag color="default" className="bid-field-value">
                                {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                              </Tag>
                            </div>
                            <div className="bid-actions">
                              <Popconfirm
                                title="Are you sure you want to accept this bid?"
                                onConfirm={() => handleBidAction(bid.bid_id, 'accept')}
                                okText="Yes"
                                cancelText="No"
                              >
                                <StyledButton
                                  size="small"
                                  type="primary"
                                  disabled={actionLoading}
                                  aria-label={`Accept bid from ${bid.brand_name || 'brand'}`}
                                  icon={<FiCheckCircle style={{ fontSize: '12px', marginRight: '4px' }} />}
                                >
                                  Accept
                                </StyledButton>
                              </Popconfirm>
                              <Popconfirm
                                title="Are you sure you want to reject this bid?"
                                onConfirm={() => handleBidAction(bid.bid_id, 'reject')}
                                okText="Yes"
                                cancelText="No"
                              >
                                <StyledButton
                                  size="small"
                                  disabled={actionLoading}
                                  aria-label={`Reject bid from ${bid.brand_name || 'brand'}`}
                                  icon={<FiXCircle style={{ fontSize: '12px', marginRight: '4px' }} />}
                                >
                                  Reject
                                </StyledButton>
                              </Popconfirm>
                            </div>
                          </BidCard>
                        ))}
                      </BidCardContainer>
                    </DraftCard>
                  </Col>
                ))}
              </Row>
                </>
            )}
          </QuickLinksCard>
        </motion.div>
      </SponsorDraftsSection>

      <Modal
        title="Create New Draft"
        open={isDraftModalVisible}
        onCancel={() => setIsDraftModalVisible(false)}
        footer={null}
        styles={{ body: { padding: 0, background: '#f9fafb', borderRadius: 16 } }}
      >
        <DraftModalBody>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmitDraft}
            initialValues={{
              platforms: [],
              audience_targets: [],
              topics: [],
              gifting_invite_required: false,
            }}
          >
            <DraftFormSection>
              <DraftFormLabel
                name="snippet"
                label="Video Snippet (Optional, max 15s)"
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
                      form.setFieldsValue({ snippet: { file: file.originFileObj } });
                    } else {
                      form.setFieldsValue({ snippet: null });
                    }
                  }}
                  maxCount={1}
                  accept="video/*"
                  listType="text"
                >
                  <MinimalActionButton icon={<UploadOutlined />} aria-label="Upload video snippet">
                    Upload Snippet
                  </MinimalActionButton>
                </Upload>
              </DraftFormLabel>
            </DraftFormSection>
            <DraftFormSection>
              <DraftFormLabel
                name="description"
                label="Brief Description"
                rules={[{ required: true, message: "Please provide a brief description of your post" }]}
                extra="Describe your post in detail (e.g., tone, style, key message)"
              >
                <StyledTextArea rows={4} placeholder="e.g., A fun and energetic TikTok Reel showcasing a new skincare routine" />
              </DraftFormLabel>
            </DraftFormSection>
            <DraftFormSection>
              <DraftFormLabel
                name="platforms"
                label="Platforms"
                rules={[{ required: true, message: "Please select at least one platform" }]}
              >
                <StyledSelect
                  mode="multiple"
                  placeholder="Select platforms"
                  optionLabelProp="label"
                >
                  {platforms.map((platform) => (
                    <Option key={platform.name} value={platform.name} label={platform.name} aria-label={platform.ariaLabel}>
                      <PlatformOption>
                        <span className="platform-icon">{platform.icon}</span>
                        {platform.name}
                      </PlatformOption>
                    </Option>
                  ))}
                </StyledSelect>
              </DraftFormLabel>
            </DraftFormSection>
            <DraftFormSection>
              <Form.Item label="Content Format" required>
                <Row gutter={[16, 16]}>
                  {contentFormats.map((format, idx) => (
                    <Col
                      xs={12}
                      sm={12}
                      md={8}
                      key={format.type}
                      style={{ marginBottom: 8 }}
                    >
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
                <Form.Item name="content_format" hidden rules={[{ required: true, message: "Please select a content format" }]}> <Input /> </Form.Item>
              </Form.Item>
            </DraftFormSection>
            <DraftFormSection>
              <DraftFormLabel
                name="audience_targets"
                label="Target Audience"
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
                label="Topics"
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
                label="Gifting/Invite Required?"
                valuePropName="checked"
                extra="Do you require gifting or an invite (e.g., product sample, event access)?"
              >
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </DraftFormLabel>
            </DraftFormSection>
            <DraftFormSection>
              <DraftFormLabel
                name="projected_views"
                label="Projected Views"
                rules={[{ required: true, message: "Please select a projected views bracket" }]}
                extra="Estimate the potential views of your post"
              >
                <StyledSelect placeholder="Select a views bracket">
                  {viewBrackets.map((bracket) => (
                    <Option key={bracket} value={bracket}>{bracket}</Option>
                  ))}
                </StyledSelect>
              </DraftFormLabel>
            </DraftFormSection>
            <DraftFormSection>
              <DraftFormLabel
                name="min_bid"
                label="Minimum Bid"
                extra="Set the minimum amount you're willing to accept"
              >
                <StyledInput type="number" min="0" step="1" placeholder="e.g., 100" />
              </DraftFormLabel>
            </DraftFormSection>
            <DraftFormSection>
              <DraftFormLabel
                name="currency"
                label="Currency"
                extra="Select the currency for your bid"
              >
                <CurrencySelector 
                  showLabel={false}
                  size="large"
                  style={{ width: '100%' }}
                />
              </DraftFormLabel>
            </DraftFormSection>
            <DraftFormSection>
              <DraftFormLabel
                name="bidding_deadline"
                label="Bidding Deadline"
                rules={[{ required: true, message: "Please set a bidding deadline" }]}
                extra="Set the deadline for brands to submit bids"
              >
                <StyledDatePicker
                  format="YYYY-MM-DD"
                  disabledDate={(current) => current && current < moment().startOf('day')}
                />
              </DraftFormLabel>
            </DraftFormSection>
            <DraftSubmitButton
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
            >
              Submit Draft
            </DraftSubmitButton>
          </Form>
        </DraftModalBody>
      </Modal>

      <Modal
        title={null}
        open={showProfileModal}
        onCancel={() => setShowProfileModal(false)}
        footer={null}
        bodyStyle={{ borderRadius: 16, padding: 0, background: '#f0fdfa' }}
      >
        <ModalHeader>
          <ModalIcon>
            <span role="img" aria-label="Celebration">🎉</span>
          </ModalIcon>
          <ModalTitle>Share your ad slot opportunities</ModalTitle>
          <ModalDesc>Your public profile is live! Add this link to your social bio so brands can book you:</ModalDesc>
        </ModalHeader>
        <ModalBody>
          <VibrantCopyInput
            value={profileUrl}
            readOnly
            addonAfter={
              <VibrantCopyButton
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(profileUrl);
                  message.success('Link copied!');
                }}
              >
                Copy
              </VibrantCopyButton>
            }
          />
          <VibrantCopyButton
            type="primary"
            block
            onClick={() => setShowProfileModal(false)}
            style={{ marginTop: 12 }}
          >
            Done
          </VibrantCopyButton>
        </ModalBody>
      </Modal>
    </Container>
  );
};

export default CreatorOverview;