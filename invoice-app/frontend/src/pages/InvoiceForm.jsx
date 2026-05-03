import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCustomers } from '../api/customers';
import { getInvoice, createInvoice, updateInvoice } from '../api/invoices';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';

const invoiceSchema = yup.object().shape({
  customerId: yup.number().required('Customer is required').typeError('Customer is required'),
  invoiceDate: yup.string().required('Invoice date is required'),
  dueDate: yup.string().required('Due date is required'),
  status: yup.string().required('Status is required'),
  notes: yup.string().nullable(),
  items: yup.array().of(
    yup.object().shape({
      name: yup.string().required('Item name is required'),
      description: yup.string().nullable(),
      quantity: yup.number().min(1, 'Min 1').required('Req').typeError('Must be number'),
      price: yup.number().min(0, 'Min 0').required('Req').typeError('Must be number'),
      taxPercent: yup.number().min(0, 'Min 0').max(100, 'Max 100').required('Req').typeError('Must be number'),
    })
  ).min(1, 'At least one item is required')
});

const InvoiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(isEditMode);
  const [customers, setCustomers] = useState([]);
  
  const { register, control, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(invoiceSchema),
    defaultValues: {
      status: 'PENDING',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ name: '', description: '', quantity: 1, price: 0, taxPercent: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchItems = watch("items") || [];

  const totals = watchItems.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    const taxPct = parseFloat(item.taxPercent) || 0;
    
    const lineSubtotal = qty * price;
    const lineTax = (lineSubtotal * taxPct) / 100;
    
    return {
      subtotal: acc.subtotal + lineSubtotal,
      tax: acc.tax + lineTax,
      total: acc.total + lineSubtotal + lineTax
    };
  }, { subtotal: 0, tax: 0, total: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const custData = await getCustomers();
        setCustomers(custData);

        if (isEditMode) {
          const invData = await getInvoice(id);
          reset({
            ...invData,
            customerId: invData.customer.id,
            items: invData.items.map(item => ({...item}))
          });
        }
      } catch (error) {
        toast.error('Failed to load data');
        navigate('/invoices');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEditMode, reset, navigate]);

  const onSubmit = async (data) => {
    if (new Date(data.dueDate) < new Date(data.invoiceDate)) {
      toast.error('Due date cannot be before invoice date');
      return;
    }

    try {
      if (isEditMode) {
        await updateInvoice(id, data);
        toast.success('Invoice updated');
      } else {
        await createInvoice(data);
        toast.success('Invoice created');
      }
      navigate('/invoices');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save invoice');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Invoice' : 'Create New Invoice'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
                  <div className="flex items-center gap-2">
                    <select
                      {...register('customerId')}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm ${errors.customerId ? 'border-danger' : 'border-gray-300'}`}
                    >
                      <option value="">Select a customer</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <Link to="/customers/new" target="_blank" className="text-primary hover:text-primary-dark whitespace-nowrap text-sm font-medium">
                      + New
                    </Link>
                  </div>
                  {errors.customerId && <p className="mt-1 text-sm text-danger">{errors.customerId.message}</p>}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    {...register('status')}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm ${errors.status ? 'border-danger' : 'border-gray-300'}`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="UNPAID">Unpaid</option>
                    <option value="PAID">Paid</option>
                  </select>
                  {errors.status && <p className="mt-1 text-sm text-danger">{errors.status.message}</p>}
                </div>

                <Input type="date" label="Invoice Date *" {...register('invoiceDate')} error={errors.invoiceDate?.message} />
                <Input type="date" label="Due Date *" {...register('dueDate')} error={errors.dueDate?.message} />
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Line Items</h3>
              <div className="space-y-4">
                {fields.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-start border-b border-gray-100 pb-4">
                    <div className="col-span-12 md:col-span-4">
                      <Input placeholder="Item Name" {...register(`items.${index}.name`)} error={errors.items?.[index]?.name?.message} className="mb-0" />
                      <Input placeholder="Description (optional)" {...register(`items.${index}.description`)} className="mt-2 mb-0" />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <Input type="number" step="1" placeholder="Qty" label={index===0?"Qty":""} {...register(`items.${index}.quantity`)} error={errors.items?.[index]?.quantity?.message} className="mb-0" />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <Input type="number" step="0.01" placeholder="Price" label={index===0?"Price":""} {...register(`items.${index}.price`)} error={errors.items?.[index]?.price?.message} className="mb-0" />
                    </div>
                    <div className="col-span-3 md:col-span-2">
                      <Input type="number" step="0.01" placeholder="Tax %" label={index===0?"Tax %":""} {...register(`items.${index}.taxPercent`)} error={errors.items?.[index]?.taxPercent?.message} className="mb-0" />
                    </div>
                    <div className="col-span-1 md:col-span-2 flex justify-end items-center mt-1">
                      {fields.length > 1 && (
                        <button type="button" onClick={() => remove(index)} className="text-danger hover:text-red-700 p-2">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button type="button" variant="secondary" onClick={() => append({ name: '', description: '', quantity: 1, price: 0, taxPercent: 0 })} className="mt-4">
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
              {errors.items && typeof errors.items.message === 'string' && (
                <p className="mt-2 text-sm text-danger">{errors.items.message}</p>
              )}
            </Card>

            <Card>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Terms</label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Payment terms, thank you note, etc."
              />
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <Card>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>₹{totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-lg">
                    <span>Total</span>
                    <span>₹{totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </Card>

              <div className="flex gap-3 flex-col sm:flex-row lg:flex-col">
                <Button type="submit" className="w-full" isLoading={isSubmitting}>
                  {isEditMode ? 'Save Changes' : 'Create Invoice'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => navigate('/invoices')} className="w-full">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
