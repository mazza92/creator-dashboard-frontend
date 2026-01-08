import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Row, Col, Typography, Upload, message } from 'antd';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import Select from 'react-select';
import { CountryDropdown } from 'react-country-region-selector';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import PasswordStrengthBar from 'react-password-strength-bar';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import './BrandOnboardingForm.css';

const { Text, Link } = Typography;

// Gradient animation (kept for button styling)
// eslint-disable-next-line no-unused-vars
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Styled Components
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  padding: 16px;
  background: transparent;
  box-sizing: border-box;
  @media (max-width: 600px) {
    align-items: flex-start;
    min-height: 100vh;
    padding: 100px 16px 24px 16px;
    margin-top: 0;
  }
`;

const FormCard = styled.div`
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 32px;
  width: 100%;
  max-width: 600px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-sizing: border-box;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  }
  @media (max-width: 768px) {
    padding: 24px;
    max-width: 90%;
    margin: 0 auto;
    transform: translateY(0);
  }
`;

const StyledInput = styled(Input)`
  border-radius: 24px;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  &:hover, &:focus {
    border-color: #26A69A;
    box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.2);
  }
`;

const StyledPasswordInput = styled(Input.Password)`
  border-radius: 24px;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  &:hover, &:focus {
    border-color: #26A69A;
    box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.2);
  }
`;

const StyledTextArea = styled(Input.TextArea)`
  border-radius: 16px;
  padding: 12px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  &:hover, &:focus {
    border-color: #26A69A;
    box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.2);
  }
`;

const StyledButton = styled(Button)`
  border-radius: 24px;
  padding: 10px 24px;
  background: ${props => props.primary ? `linear-gradient(135deg, #26A69A, #4DB6AC)` : '#fff'};
  border: ${props => props.primary ? 'none' : '1px solid #d1d5db'};
  color: ${props => props.primary ? '#fff' : '#4b5563'};
  font-weight: 600;
  font-size: 14px;
  height: 44px;
  transition: background 0.2s ease, transform 0.2s ease;
  &:hover {
    background: ${props => props.primary ? `linear-gradient(135deg, #4DB6AC, #26A69A)` : '#e6f7ff'};
    color: ${props => props.primary ? '#fff' : '#26A69A'};
    border-color: ${props => props.primary ? 'none' : '#26A69A'};
    transform: scale(1.02);
  }
  &:disabled {
    background: #d1d5db;
    color: #6b7280;
    cursor: not-allowed;
  }
  @media (max-width: 600px) {
    font-size: 13px;
    padding: 8px 16px;
    height: 40px;
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const StepDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.active ? '#26A69A' : '#d1d5db'};
  transition: background 0.3s ease;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  margin-bottom: 8px;
  @media (max-width: 600px) {
    font-size: 24px;
  }
`;

const Subtitle = styled(Text)`
  display: block;
  text-align: center;
  color: #4b5563;
  font-size: 14px;
  margin-bottom: 24px;
  @media (max-width: 600px) {
    font-size: 13px;
  }
`;

const LinkText = styled(Link)`
  color: #26A69A;
  font-weight: 500;
  &:hover {
    color: #4DB6AC;
    text-decoration: underline;
  }
`;



// Framer Motion variants
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

// Custom styles for react-select
const selectStyles = {
  control: (provided) => ({
    ...provided,
    borderRadius: '24px',
    border: '1px solid #d1d5db',
    padding: '4px',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    '&:hover': {
      borderColor: '#26A69A',
    },
    '&:focus': {
      borderColor: '#26A69A',
      boxShadow: '0 0 0 3px rgba(38, 166, 154, 0.2)',
    },
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '16px',
    fontFamily: 'Inter, sans-serif',
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: '14px',
    color: state.isSelected ? '#fff' : '#4b5563',
    background: state.isSelected ? '#26A69A' : state.isFocused ? '#e6f7ff' : '#fff',
  }),
};

// Categories options (unchanged)
const categoriesOptions = [
  { value: 'Business & Startups', label: 'Business & Startups' },
  { value: 'Careers & Office', label: 'Careers & Office' },
  { value: 'Marketing & Sales', label: 'Marketing & Sales' },
  { value: 'Finance & Web 3', label: 'Finance & Web 3' },
  { value: 'IT & Tech', label: 'IT & Tech' },
  { value: 'Global Affairs & Diplomacy', label: 'Global Affairs & Diplomacy' },
  { value: 'Arts & Culture', label: 'Arts & Culture' },
  { value: 'Food & Nutrition', label: 'Food & Nutrition' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Motorsports & Biking', label: 'Motorsports & Biking' },
  { value: 'Health & Medical', label: 'Health & Medical' },
  { value: 'Fitness & Personal Growth', label: 'Fitness & Personal Growth' },
  { value: 'Education', label: 'Education' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Gaming & Streaming', label: 'Gaming & Streaming' },
  { value: 'Relationships & Family', label: 'Relationships & Family' },
  { value: 'Animals', label: 'Animals' },
  { value: 'Fashion', label: 'Fashion' },
  { value: 'Beauty', label: 'Beauty' },
  { value: 'Inclusion & Social Impact', label: 'Inclusion & Social Impact' },
  { value: 'Religions & Spirituality', label: 'Religions & Spirituality' },
  { value: 'STEM', label: 'STEM' },
  { value: 'Environment & Energy', label: 'Environment & Energy' },
  { value: 'Music & Audio', label: 'Music & Audio' },
  { value: 'TV, Movies, Video', label: 'TV, Movies, Video' },
  { value: 'Home & Indoor Activities', label: 'Home & Indoor Activities' },
  { value: 'Nature & Outdoor Activities', label: 'Nature & Outdoor Activities' },
  { value: 'Law, Media & Politics', label: 'Law, Media & Politics' },
  { value: 'Magic & Paranormal', label: 'Magic & Paranormal' },
  { value: 'Ecommerce & Retail', label: 'Ecommerce & Retail' },
  { value: 'Cars & Urban', label: 'Cars & Urban' },
  { value: 'Humanities & Social Sciences', label: 'Humanities & Social Sciences' },
];

function BrandOnboardingForm({ role, onSuccess, onError }) {
  const { trackSignUp, trackOnboardingComplete, trackFormSubmission } = useAnalytics();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    password: '',
    confirmPassword: '',
    brandName: '',
    brandWebsite: '',
    brandDescription: '',
    categories: [],
    termsAccepted: false,
    role: 'brand',
    postUrls: ['', '', ''],
  });
  const [logoFile, setLogoFile] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // eslint-disable-next-line no-unused-vars
  const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co');

  const handleLogoUpload = (file) => {
    const isPngOrJpeg = file.type === 'image/png' || file.type === 'image/jpeg';
    if (!isPngOrJpeg) {
      message.error('You can only upload PNG or JPEG files!');
      return Upload.LIST_IGNORE;
    }
    setLogoFile(file);
    return false;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Preserve spaces for fields that allow them
    const fieldsToPreserveSpaces = ['brandDescription', 'brandName', 'firstName', 'lastName', 'brandWebsite'];
    const processedValue = fieldsToPreserveSpaces.includes(name) ? value : value.trim();
    setFormData({ ...formData, [name]: processedValue });
    form.setFieldsValue({ [name]: processedValue });
    if (name === 'password' || name === 'confirmPassword') {
      form.validateFields(['confirmPassword']).catch(() => {});
    }
  };
  

  const handlePostUrlChange = (index, value) => {
    const updatedPostUrls = [...formData.postUrls];
    updatedPostUrls[index] = value;
    setFormData({ ...formData, postUrls: updatedPostUrls });
  };

  const handlePhoneChange = (phone) => {
    setFormData({ ...formData, phone });
    form.setFieldsValue({ phone });
  };

  const handleNextStep = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (step === 1) {
        await form.validateFields(['firstName', 'lastName', 'email', 'phone', 'country', 'password', 'confirmPassword', 'termsAccepted']);
        setStep(2);
      } else if (step === 2) {
        await form.validateFields(['brandName', 'brandWebsite', 'brandDescription', 'categories', 'brandLogo']);
        if (!logoFile) {
          message.error('Please upload a brand logo.');
          throw new Error('Missing logo');
        }
        setStep(3);
      }
    } catch (error) {
      message.error('Please correct the errors in the form.');
    } finally {
      setLoading(false);
    }
  };
  

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!formData.termsAccepted) {
      message.error('You must accept the terms and conditions.');
      return;
    }
  
    setLoading(true);
    const formDataToSubmit = new FormData();
    formDataToSubmit.append('firstName', formData.firstName);
    formDataToSubmit.append('lastName', formData.lastName);
    formDataToSubmit.append('email', formData.email);
    formDataToSubmit.append('phone', formData.phone);
    formDataToSubmit.append('country', formData.country);
    formDataToSubmit.append('password', formData.password);
    formDataToSubmit.append('brandName', formData.brandName);
    formDataToSubmit.append('brandWebsite', formData.brandWebsite);
    formDataToSubmit.append('brandDescription', formData.brandDescription);
    formDataToSubmit.append('categories', JSON.stringify(formData.categories.map(cat => cat.value)));
    formDataToSubmit.append('termsAccepted', formData.termsAccepted);
    formDataToSubmit.append('role', formData.role);
    formDataToSubmit.append('postUrls', JSON.stringify(formData.postUrls.filter(url => url)));
    if (logoFile) {
      formDataToSubmit.append('brandLogo', logoFile);
    }
  
    console.log('🟢 Form Data:', Object.fromEntries(formDataToSubmit));
  
    try {
      const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co');
      console.log('🟢 API Endpoint:', `${API_URL}/register/brand`); // Removed .replace(/\/api$/, '')
      const response = await axios.post(`${API_URL}/register/brand`, formDataToSubmit, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      console.log('🟢 Registration response:', { status: response.status, data: response.data });
      if (response.status === 201 && response.data.redirect_url) {
        const responseData = {
          redirect_url: response.data.redirect_url,
          user_role: response.data.user_role || 'brand',
          message: response.data.message || 'Registration successful',
          user_id: response.data.user_id,
          brand_id: response.data.brand_id,
        };
        console.log('🟢 Response data with IDs:', responseData);
        
        // Track new account creation and onboarding completion
        trackSignUp('email', 'brand', {
          email: formData.email,
          brand_name: formData.brandName,
          brand_id: responseData.brand_id
        });
        trackOnboardingComplete('brand');
        trackFormSubmission('brand_signup', true);
        
        console.log('🟢 Calling onSuccess with:', { data: responseData });
        try {
          onSuccess({ data: responseData });
          console.log('🟢 onSuccess completed successfully');
        } catch (e) {
          console.error('🔥 onSuccess error:', e.message, e.stack);
          throw new Error('Failed to process registration success');
        }
        message.success('Redirecting to verify your email...');
      } else {
        console.error('🔥 Invalid response:', response.data);
        throw new Error('Invalid or missing redirect URL');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to register brand';
      console.error('🔥 Registration error:', { error: error.message, response: error.response?.data });
      trackFormSubmission('brand_signup', false);
      onError(new Error(errorMessage));
      message.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container>
      <motion.div variants={cardVariants} initial="hidden" animate="visible">
        <FormCard>
          <Title>Brand Registration</Title>
          <Subtitle>Step {step} of 3: {step === 1 ? 'Basic Information' : step === 2 ? 'Brand Information' : 'Social Posts'}</Subtitle>

          <StepIndicator>
            {[1, 2, 3].map((s) => (
              <StepDot key={s} active={step >= s} />
            ))}
          </StepIndicator>

          <Form form={form} layout="vertical" role="form">
            {step === 1 && (
              <>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="First Name"
                      name="firstName"
                      rules={[{ required: true, message: 'Please enter your first name' }]}
                    >
                      <StyledInput
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        aria-label="First Name"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Last Name"
                      name="lastName"
                      rules={[{ required: true, message: 'Please enter your last name' }]}
                    >
                      <StyledInput
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        aria-label="Last Name"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' },
                  ]}
                >
                  <StyledInput
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    aria-label="Email"
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Phone"
                      name="phone"
                      rules={[{ required: true, message: 'Please enter your phone number' }]}
                    >
                      <PhoneInput
                        country={'us'}
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        inputStyle={{
                          width: '100%',
                          height: '44px',
                          borderRadius: '24px',
                          border: '1px solid #d1d5db',
                          padding: '10px 16px 10px 48px',
                          fontSize: '14px',
                          fontFamily: 'Inter, sans-serif',
                        }}
                        buttonStyle={{
                          borderRadius: '24px 0 0 24px',
                          border: '1px solid #d1d5db',
                          borderRight: 'none',
                          background: '#fff',
                          padding: '0 8px',
                          width: '48px',
                        }}
                        containerStyle={{
                          marginBottom: '8px',
                        }}
                        dropdownStyle={{
                          borderRadius: '16px',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Country"
                      name="country"
                      rules={[{ required: true, message: 'Please select your country' }]}
                    >
                      <CountryDropdown
                        value={formData.country}
                        onChange={(val) => {
                          setFormData({ ...formData, country: val });
                          form.setFieldsValue({ country: val });
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          borderRadius: '24px',
                          border: '1px solid #d1d5db',
                          fontSize: '14px',
                        }}
                        classes="ant-input"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="New Password"
                  name="password"
                  rules={[
                    { required: true, message: 'Please enter a password' },
                    { min: 8, message: 'Password must be at least 8 characters' },
                  ]}
                >
                  <StyledPasswordInput
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter a new password"
                    aria-label="New Password"
                    autoComplete="new-password"
                  />
                  <PasswordStrengthBar password={formData.password} style={{ marginTop: '8px' }} />
                </Form.Item>

                <Form.Item
                  label="Confirm Password"
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Please confirm your password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match'));
                      },
                    }),
                  ]}
                  validateTrigger={['onChange', 'onBlur']}
                >
                  <StyledPasswordInput
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    aria-label="Confirm Password"
                    autoComplete="new-password"
                  />
                </Form.Item>

                <Form.Item
                  name="termsAccepted"
                  valuePropName="checked"
                  rules={[{ validator: (_, value) => value ? Promise.resolve() : Promise.reject('You must accept the terms') }]}
                >
                  <Checkbox
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                  >
                    Accept our <LinkText href="/terms" target="_blank">Terms and Conditions</LinkText>
                  </Checkbox>
                </Form.Item>

                <motion.div variants={buttonVariants} whileHover="hover">
                  <StyledButton
                    type="primary"
                    primary
                    onClick={handleNextStep}
                    loading={loading}
                    disabled={loading}
                    block
                    aria-label="Next: Brand Information"
                  >
                    Next: Brand Information
                  </StyledButton>
                </motion.div>

                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <Text style={{ color: '#4b5563' }}>Already have an account? </Text>
                  <LinkText href="/login">Sign in</LinkText>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <Form.Item
                  label="Brand Name"
                  name="brandName"
                  rules={[{ required: true, message: 'Please enter your brand name' }]}
                >
                  <StyledInput
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleChange}
                    placeholder="Enter brand name"
                    aria-label="Brand Name"
                  />
                </Form.Item>

                <Form.Item
                  label="Brand Website"
                  name="brandWebsite"
                  rules={[
                    { required: true, message: 'Please enter your brand website' },
                    { type: 'url', message: 'Please enter a valid URL' },
                  ]}
                >
                  <StyledInput
                    name="brandWebsite"
                    value={formData.brandWebsite}
                    onChange={handleChange}
                    placeholder="e.g., https://www.brand.com"
                    aria-label="Brand Website"
                  />
                </Form.Item>

                <Form.Item
                  label="Brand Description"
                  name="brandDescription"
                  rules={[{ required: true, message: 'Please enter a brand description' }]}
                >
                  <StyledTextArea
                    name="brandDescription"
                    value={formData.brandDescription}
                    onChange={handleChange}
                    placeholder="Describe your brand in a few words"
                    maxLength={150}
                    showCount
                    rows={4}
                    aria-label="Brand Description"
                  />
                </Form.Item>

                <Form.Item
                  label="Category"
                  name="categories"
                  rules={[{ required: true, message: 'Please select at least one category' }]}
                >
                  <Select
                    isMulti
                    name="categories"
                    options={categoriesOptions}
                    onChange={(selectedOptions) => {
                      setFormData({ ...formData, categories: selectedOptions });
                      form.setFieldsValue({ categories: selectedOptions });
                    }}
                    placeholder="Select categories"
                    styles={selectStyles}
                  />
                </Form.Item>

                <Form.Item
                  label="Brand Logo"
                  name="brandLogo"
                  rules={[{ required: true, message: 'Please upload a brand logo' }]}
                >
                  <Upload
                    name="logo"
                    listType="picture"
                    beforeUpload={handleLogoUpload}
                    maxCount={1}
                  >
                    <StyledButton icon={<UploadOutlined />} aria-label="Upload Brand Logo">
                      Upload Logo (PNG or JPEG)
                    </StyledButton>
                  </Upload>
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <motion.div variants={buttonVariants} whileHover="hover">
                      <StyledButton onClick={handlePreviousStep} block aria-label="Previous Step">
                        Previous
                      </StyledButton>
                    </motion.div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <motion.div variants={buttonVariants} whileHover="hover">
                      <StyledButton
                        type="primary"
                        primary
                        onClick={handleNextStep}
                        loading={loading}
                        disabled={loading}
                        block
                        aria-label="Next: Social Posts"
                      >
                        Next: Social Posts
                      </StyledButton>
                    </motion.div>
                  </Col>
                </Row>
              </>
            )}

            {step === 3 && (
              <>
                <Subtitle>Paste up to 3 URLs of your best social posts to showcase on your profile (e.g., Instagram, Twitter).</Subtitle>
                {formData.postUrls.map((url, index) => (
                  <Form.Item
                    label={`Post ${index + 1} URL`}
                    key={index}
                    name={`postUrl${index}`}
                    rules={[{ type: 'url', message: 'Please enter a valid URL', when: (value) => !!value }]}
                  >
                    <StyledInput
                      value={url}
                      onChange={(e) => handlePostUrlChange(index, e.target.value)}
                      placeholder="e.g., https://www.instagram.com/p/xyz/"
                      aria-label={`Social Post URL ${index + 1}`}
                    />
                  </Form.Item>
                ))}

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <motion.div variants={buttonVariants} whileHover="hover">
                      <StyledButton onClick={handlePreviousStep} block aria-label="Previous Step">
                        Previous
                      </StyledButton>
                    </motion.div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <motion.div variants={buttonVariants} whileHover="hover">
                      <StyledButton
                        type="primary"
                        primary
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={loading}
                        block
                        aria-label="Complete Registration"
                      >
                        Complete Registration
                      </StyledButton>
                    </motion.div>
                  </Col>
                </Row>
              </>
            )}
          </Form>
        </FormCard>
      </motion.div>
    </Container>
  );
}

export default BrandOnboardingForm;