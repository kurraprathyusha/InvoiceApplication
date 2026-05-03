import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCustomer, createCustomer, updateCustomer } from '../api/customers';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';

const customerSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().nullable(),
  address: yup.string().nullable(),
  gstNumber: yup.string().nullable(),
});

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(isEditMode);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(customerSchema)
  });

  useEffect(() => {
    if (isEditMode) {
      const fetch = async () => {
        try {
          const data = await getCustomer(id);
          reset(data);
        } catch {
          toast.error('Failed to fetch customer');
          navigate('/customers');
        } finally {
          setLoading(false);
        }
      };
      fetch();
    }
  }, [id, reset, navigate, isEditMode]);

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await updateCustomer(id, data);
        toast.success('Customer updated');
      } else {
        await createCustomer(data);
        toast.success('Customer created');
      }
      navigate('/customers');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save customer');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/customers')} className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Customer' : 'Add New Customer'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{isEditMode ? 'Update customer information.' : 'Add a new customer to your account.'}</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Input label="Full Name *" placeholder="John Smith" {...register('name')} error={errors.name?.message} />
            <Input label="Email Address *" type="email" placeholder="john@example.com" {...register('email')} error={errors.email?.message} />
            <Input label="Phone" placeholder="+91 98765 43210" {...register('phone')} error={errors.phone?.message} />
            <Input label="GST Number" placeholder="22AAAAA0000A1Z5" {...register('gstNumber')} error={errors.gstNumber?.message} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
            <textarea
              {...register('address')}
              rows={3}
              placeholder="123 Main St, City, State, PIN"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => navigate('/customers')}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>{isEditMode ? 'Save Changes' : 'Add Customer'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CustomerForm;
