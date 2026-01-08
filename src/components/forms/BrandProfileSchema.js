// BrandProfileSchema.js
import * as Yup from 'yup';

export const BrandProfileSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  name: Yup.string()
    .required('Brand name is required'),
  description: Yup.string()
    .required('Description is required'),
  category: Yup.string()
    .required('Category is required'),
  website: Yup.string()
    .url('Invalid website URL')
    .required('Website is required'),
  spotlight: Yup.boolean(),
  logo: Yup.string()
    .url('Invalid logo URL')
    .required('Logo URL is required'),
});
