import React, { useState, useEffect } from "react";
import { Modal, Steps, Form, Input, Button, DatePicker, Checkbox, message, Select } from "antd";
import { FaInstagram, FaYoutube, FaTwitter, FaTiktok, FaTwitch, FaSnapchat, FaLinkedin } from 'react-icons/fa';
import api from "../config/api";
import moment from "moment";
import { createStyles } from 'antd-style';

const { Step } = Steps;
const { Option } = Select;

const useStyle = createStyles(({ prefixCls, css }) => ({
  modalContent: css`
    padding: 24px;
    background: #ffffff;
    border-radius: 12px;
    font-family: 'Inter', sans-serif;
    .ant-steps {
      margin-bottom: 24px;
    }
    .ant-form-item {
      margin-bottom: 16px;
    }
    .ant-btn-primary {
      background: linear-gradient(135deg, #26A69A, #4DB6AC);
      border: none;
      border-radius: 20px;
      height: 40px;
      font-size: 16px;
      font-weight: 600;
      &:hover {
        background: linear-gradient(135deg, #4DB6AC, #26A69A);
      }
    }
    .ant-btn-default {
      border-radius: 20px;
      height: 40px;
    }
    .platform-select {
      .ant-select-selection-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        background: #f8fafc;
        border-radius: 8px;
        margin: 2px;
        border: 1px solid rgba(38, 166, 154, 0.1);
        
        .platform-icon {
          font-size: 16px;
          display: flex;
          align-items: center;
        }
      }
    }
  `,
  stepContent: css`
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
    min-height: 200px;
  `,
}));

const PlatformOption = ({ value, icon: Icon, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <Icon style={{ color, fontSize: '16px' }} />
    <span>{value}</span>
  </div>
);

const platforms = [
  { value: 'Instagram', label: 'Instagram', icon: FaInstagram, color: '#E1306C' },
  { value: 'YouTube', label: 'YouTube', icon: FaYoutube, color: '#FF0000' },
  { value: 'TikTok', label: 'TikTok', icon: FaTiktok, color: '#000000' },
  { value: 'Twitter', label: 'Twitter', icon: FaTwitter, color: '#1DA1F2' },
  { value: 'Twitch', label: 'Twitch', icon: FaTwitch, color: '#9146FF' },
  { value: 'Snapchat', label: 'Snapchat', icon: FaSnapchat, color: '#FFFC00' },
  { value: 'LinkedIn', label: 'LinkedIn', icon: FaLinkedin, color: '#0077B5' },
];

const BookingModal = ({ visible, onClose, selectedBookingDetails, userRole }) => {
  const { styles } = useStyle();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [brandName, setBrandName] = useState(null);
  const [isBrand, setIsBrand] = useState(userRole === "brand");

  const creator = selectedBookingDetails?.creator;

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setCurrentStep(0);
    }
    if (userRole === "brand" && visible) {
      const fetchBrandProfile = async () => {
        try {
          const response = await api.get("/profile", { withCredentials: true });
          console.log("📌 BookingModal /profile response:", response.data);
          const { name } = response.data;
          setBrandName(name || 'Unknown Brand');
          form.setFieldsValue({ brand_name: name || 'Unknown Brand' });
          setIsBrand(true);
        } catch (error) {
          console.error("🔥 Error fetching brand profile:", error.response?.data || error.message);
          setBrandName('Unknown Brand');
          form.setFieldsValue({ brand_name: 'Unknown Brand' });
          setIsBrand(true);
        }
      };
      fetchBrandProfile();
    } else {
      setIsBrand(userRole === "brand");
    }
  }, [visible, userRole, form]);

  const steps = [
    {
      title: "Brand Details",
      fields: ['brand_name', 'contact_email', 'contact_phone'],
      content: (
        <div className={styles.stepContent}>
          <Form.Item
            name="brand_name"
            label="Brand Name"
            initialValue={brandName}
            rules={[{ required: !brandName, message: 'Please enter your brand name' }]}
          >
            <Input placeholder="Enter your brand name" disabled={!!brandName} />
          </Form.Item>
          <Form.Item
            name="contact_email"
            label="Contact Email"
            rules={[
              { required: true, message: 'Please enter your contact email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Enter your contact email" />
          </Form.Item>
          <Form.Item
            name="contact_phone"
            label="Contact Phone"
            rules={[{ required: true, message: 'Please enter your contact phone number' }]}
          >
            <Input placeholder="Enter your contact phone number" />
          </Form.Item>
        </div>
      ),
    },
    {
      title: "Campaign Brief",
      fields: ['product_name', 'product_link', 'brief', 'promotion_date', 'free_sample', 'platforms'],
      content: (
        <div className={styles.stepContent}>
          <Form.Item
            name="product_name"
            label="Campaign Name"
            rules={[{ required: true, message: 'Please enter the campaign name' }]}
          >
            <Input placeholder="Enter the campaign name" />
          </Form.Item>
          <Form.Item
            name="product_link"
            label="Campaign Link"
            rules={[
              { required: true, message: 'Please enter the campaign link' },
              { type: 'url', message: 'Please enter a valid URL' },
            ]}
          >
            <Input placeholder="Enter the campaign link (e.g., https://example.com)" />
          </Form.Item>
          <Form.Item
            name="platforms"
            label="Platforms"
            rules={[{ required: true, message: 'Please select at least one platform' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select platforms"
              style={{ width: '100%' }}
              className="platform-select"
              optionLabelProp="label"
            >
              {platforms.map(platform => (
                <Option 
                  key={platform.value} 
                  value={platform.value}
                  label={platform.label}
                >
                  <PlatformOption 
                    value={platform.label}
                    icon={platform.icon}
                    color={platform.color}
                  />
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="brief"
            label="Campaign Brief"
            rules={[{ required: true, message: 'Please enter the campaign brief' }]}
          >
            <Input.TextArea rows={4} placeholder="Describe the campaign brief" />
          </Form.Item>
          <Form.Item
            name="promotion_date"
            label="Promotion Date"
            rules={[{ required: true, message: 'Please select the promotion date' }]}
          >
            <DatePicker
              format="YYYY-MM-DD"
              disabledDate={(current) => current && current < moment().startOf('day')}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item name="free_sample" valuePropName="checked">
            <Checkbox>Offer a free sample</Checkbox>
          </Form.Item>
        </div>
      ),
    },
    {
      title: "Budget Proposal",
      fields: ['bid_amount'],
      content: (
        <div className={styles.stepContent}>
          <Form.Item
            name="bid_amount"
            label="Budget Proposal (€)"
            rules={[
              { required: true, message: 'Please enter your budget proposal' },
              {
                validator: (_, value) =>
                  value && parseFloat(value) > 0
                    ? Promise.resolve()
                    : Promise.reject('Budget must be a positive number'),
              },
            ]}
          >
            <Input type="number" step="0.01" placeholder="Enter your budget proposal" />
          </Form.Item>
        </div>
      ),
    },
  ];

  const handleNext = async () => {
    if (loading) return;
    try {
      const fields = steps[currentStep].fields;
      await form.validateFields(fields);
      console.log("📌 Validated fields in step", currentStep, ":", form.getFieldsValue(fields));
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    } catch (error) {
      console.error("🚨 Validation error in step", currentStep, ":", error);
      message.error("Please complete all required fields");
    }
  };

  const handleBack = () => {
    if (!loading && currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (loading || !isBrand) {
      message.error("Only brands can create campaign invites.");
      return;
    }
    try {
      setLoading(true);
      const allFields = steps.flatMap(step => step.fields);
      const values = await form.validateFields(allFields);
      console.log("🟢 All form values before submission:", values);
  
      const payload = {
        creator_id: creator?.id,
        product_name: values.product_name,
        product_link: values.product_link,
        brief: values.brief,
        bid_amount: parseFloat(values.bid_amount),
        promotion_date: values.promotion_date ? values.promotion_date.format("YYYY-MM-DD") : null,
        free_sample: values.free_sample || false,
        platforms: values.platforms || [],
      };
  
      // Explicitly check for required fields
      const requiredFields = ['product_name', 'product_link', 'brief', 'promotion_date', 'bid_amount', 'platforms'];
      const missingFields = requiredFields.filter(field => {
        if (field === 'platforms') {
          return !payload[field] || payload[field].length === 0;
        }
        return !payload[field] || (field === 'promotion_date' && payload[field] === null);
      });
  
      if (missingFields.length > 0) {
        console.error("🚨 Missing required fields in payload:", missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
  
      console.log("🟢 Submitting campaign invite:", payload, { cookies: document.cookie });
  
      const response = await api.post("/create-campaign-invite", payload, {
        withCredentials: true, // Already set in api.js, but explicit for clarity
      });
  
      console.log("📌 Campaign invite response:", response.data);
      message.success("Campaign invite created successfully!");
      form.resetFields();
      setCurrentStep(0);
      onClose();
    } catch (error) {
      console.error("🚨 Error creating campaign invite:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        cookies: document.cookie,
      });
      message.error(error.response?.data?.error || "Failed to create campaign invite. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onCancel={() => !loading && onClose()}
      footer={null}
      title={`Create Campaign Invite for @${creator?.username || 'Creator'}`}
      width={600}
      className={styles.modalContent}
      maskClosable={false}
    >
      <Steps current={currentStep} size="small" style={{ marginBottom: "24px" }}>
        {steps.map((step) => (
          <Step key={step.title} title={step.title} />
        ))}
      </Steps>
      <Form form={form} layout="vertical" style={{ marginTop: "24px" }}>
        {steps[currentStep].content}
        <div style={{ marginTop: "24px", textAlign: "right" }}>
          {currentStep > 0 && (
            <Button onClick={handleBack} style={{ marginRight: 8 }} disabled={loading}>
              Back
            </Button>
          )}
          <Button
            type="primary"
            onClick={handleNext}
            disabled={loading}
            loading={loading}
          >
            {currentStep === steps.length - 1 ? "Submit Invite" : "Next"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default BookingModal;