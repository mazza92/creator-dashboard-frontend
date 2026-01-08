import React from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { BrandProfileSchema } from './BrandProfileSchema'; // Import the validation schema
import './FormStyles.css'; // CSS styles for better UI

function BrandProfileForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(BrandProfileSchema), // Integrate Yup validation
  });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/register/brand',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(response.data);  // Log response for debugging
      alert('Brand profile created successfully!');
    } catch (error) {
      console.error('Error creating brand profile:', error);
      alert('An error occurred while creating the profile.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form">
      <h2>Create Brand Profile</h2>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          {...register('email')}
          required // Optional: HTML5 validation
        />
        <p className="error-message">{errors.email?.message}</p>
      </div>

      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          {...register('password')}
          required // Optional: HTML5 validation
        />
        <p className="error-message">{errors.password?.message}</p>
      </div>

      <div className="form-group">
        <label>Brand Name</label>
        <input
          type="text"
          {...register('name')}
          required // Optional: HTML5 validation
        />
        <p className="error-message">{errors.name?.message}</p>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          {...register('description')}
          required // Optional: HTML5 validation
        ></textarea>
        <p className="error-message">{errors.description?.message}</p>
      </div>

      <div className="form-group">
        <label>Category</label>
        <input
          type="text"
          {...register('category')}
          required // Optional: HTML5 validation
        />
        <p className="error-message">{errors.category?.message}</p>
      </div>

      <div className="form-group">
        <label>Website</label>
        <input
          type="url" // Use 'url' input type for validation
          {...register('website')}
          required // Optional: HTML5 validation
        />
        <p className="error-message">{errors.website?.message}</p>
      </div>

      <div className="form-group">
        <label>Logo URL</label>
        <input
          type="url" // Use 'url' input type for better UX
          {...register('logo')}
        />
        <p className="error-message">{errors.logo?.message}</p>
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            {...register('spotlight')}
          />
          Spotlight
        </label>
      </div>

      <button type="submit" className="submit-button">
        Create Profile
      </button>
    </form>
  );
}

export default BrandProfileForm;
