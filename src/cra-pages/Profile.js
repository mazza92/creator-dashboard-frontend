import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSecurity } from '../contexts/SecurityContext';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { Divider } from 'antd';
import CurrencySelector from '../components/CurrencySelector';

const ProfileContainer = styled(motion.div)`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Section = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
`;

const SectionTitle = styled.h2`
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.2rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #666;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #007bff;
  }

  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const SuccessMessage = styled.div`
  color: #28a745;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const Button = styled.button`
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #0056b3;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const DangerButton = styled(Button)`
  background: #dc3545;

  &:hover {
    background: #c82333;
  }
`;

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, changePassword, error, clearError } = useSecurity();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const validateProfileForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!formData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (formData.newPassword) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.newPassword)) {
        errors.newPassword = 'Password does not meet requirements';
      }
    }

    if (formData.newPassword && !formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    // Clear API error when user makes changes
    if (error) {
      clearError();
    }
    // Clear success message when user makes changes
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await updateProfile({
        name: formData.name,
        email: formData.email,
      });
      if (success) {
        setSuccessMessage('Profile updated successfully');
      }
    } catch (err) {
      console.error('Profile update error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      if (success) {
        setSuccessMessage('Password changed successfully');
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      }
    } catch (err) {
      console.error('Password change error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProfileContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Title>Profile Settings</Title>

      <Form onSubmit={handleProfileSubmit}>
        <Section>
          <SectionTitle>Personal Information</SectionTitle>
          <InputGroup>
            <Label htmlFor="name">Full Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
            {validationErrors.name && (
              <ErrorMessage>{validationErrors.name}</ErrorMessage>
            )}
          </InputGroup>

          <InputGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
            {validationErrors.email && (
              <ErrorMessage>{validationErrors.email}</ErrorMessage>
            )}
          </InputGroup>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </Section>

        <Divider />

        <Section>
          <SectionTitle>Display Preferences</SectionTitle>
          <InputGroup>
            <CurrencySelector 
              showLabel={true}
              style={{ marginBottom: '16px' }}
            />
          </InputGroup>
        </Section>
      </Form>

      <Form onSubmit={handlePasswordSubmit}>
        <Section>
          <SectionTitle>Change Password</SectionTitle>
          <InputGroup>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter your current password"
              required
            />
            {validationErrors.currentPassword && (
              <ErrorMessage>{validationErrors.currentPassword}</ErrorMessage>
            )}
          </InputGroup>

          <InputGroup>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter your new password"
            />
            {validationErrors.newPassword && (
              <ErrorMessage>{validationErrors.newPassword}</ErrorMessage>
            )}
          </InputGroup>

          <InputGroup>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your new password"
            />
            {validationErrors.confirmPassword && (
              <ErrorMessage>{validationErrors.confirmPassword}</ErrorMessage>
            )}
          </InputGroup>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Changing Password...' : 'Change Password'}
          </Button>
        </Section>
      </Form>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
    </ProfileContainer>
  );
};

export default Profile; 