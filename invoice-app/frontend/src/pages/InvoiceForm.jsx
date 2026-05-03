import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
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

const selectCls = (hasError) =>
  `w-full px-3 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${hasError ? 'border-red-400' : 'border-gray-200'}`;

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

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchItems = watch('items') || [];

  const totals = watchItems.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    const taxPct = parseFloat(item.taxPercent) || 0;
    const lineSubtotal = qty * price;
    const lineTax = (lineSubtotal * taxPct) / 100;
    return { subtotal: acc.subtotal + lineSubtotal, tax: acc.tax + lineTax, total: acc.total + lineSubtotal + lineTax };
  }, { subtotal: 0, tax: 0, total: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const custData = await getCustomers();
        setCustomers(custData);
        if (isEditMode) {
          const invData = await getInvoice(id);
          reset({ ...invData, customerId: invData.customer?.id, items: invData.items.map(item => ({ ...item })) });
        }
      } catch {
        toast.error('Failed to load data');
        navigate('/invoices');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEditMode, reset, navigate]);

  const onSubmit = async (data) => {
    if (data.dueDate < data.invoiceDate) {
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
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/invoices')} className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Invoice' : 'Create New Invoice'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{isEditMode ? 'Update invoice details.' : 'Fill in the details to create a new invoice.'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Details */}
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Invoice Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer *</label>
                  <div className="flex items-center gap-2">
                    <select {...register('customerId', { valueAsNumber: true })} className={selectCls(errors.customerId)}>
                      <option value="">Select a customer</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <Link to="/customers/new" target="_blank" className="text-primary hover:text-primary-dark whitespace-nowrap text-sm font-medium">
                      + New
                    </Link>
                  </div>
                  {errors.customerId && <p className="mt-1 text-xs text-red-500">{errors.customerId.message}</p>}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status *</label>
                  <select {...register('status')} className={selectCls(errors.status)}>
                    <option value="PENDING">Pending</option>
                    <option value="UNPAID">Unpaid</option>
                    <option value="PAID">Paid</option>
                  </select>
                  {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status.message}</p>}
                </div>

                <Input type="date" label="Invoice Date *" {...register('invoiceDate')} error={errors.invoiceDate?.message} />
                <Input type="date" label="Due Date *" {...register('dueDate')} error={errors.dueDate?.message} />
              </div>
            </Card>

            {/* Line Items */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Line Items</h3>
              </div>

              {/* Column headers */}
              <div className="hidden md:grid grid-cols-12 gap-2 mb-2 px-1">
                <div className="col-span-4 text-xs font-medium text-gray-400 uppercase tracking-wide">Item</div>
                <div className="col-span-2 text-xs font-medium text-gray-400 uppercase tracking-wide text-right">Qty</div>
                <div className="col-span-2 text-xs font-medium text-gray-400 uppercase tracking-wide text-right">Price (₹)</div>
                <div className="col-span-2 text-xs font-medium text-gray-400 uppercase tracking-wide text-right">Tax %</div>
                <div className="col-span-1 text-xs font-medium text-gray-400 uppercase tracking-wide text-right">Total</div>
                <div className="col-span-1" />
              </div>

              <div className="space-y-3">
                {fields.map((item, index) => {
                  const qty = parseFloat(watchItems[index]?.quantity) || 0;
                  const price = parseFloat(watchItems[index]?.price) || 0;
                  const tax = parseFloat(watchItems[index]?.taxPercent) || 0;
                  const lineTotal = qty * price * (1 + tax / 100);
                  return (
                    <div key={item.id} className="border border-gray-100 rounded-xl p-3 bg-gray-50/40">
                      <div className="grid grid-cols-12 gap-2 items-start">
                        <div className="col-span-12 md:col-span-4 space-y-2">
                          <input
                            {...register(`items.${index}.name`)}
                            placeholder="Item name *"
                            className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.items?.[index]?.name ? 'border-red-400' : 'border-gray-200'}`}
                          />
                          <input
                            {...register(`items.${index}.description`)}
                            placeholder="Description (optional)"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          />
                          {errors.items?.[index]?.name && <p className="text-xs text-red-500">{errors.items[index].name.message}</p>}
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <input
                            type="number" step="1"
                            {...register(`items.${index}.quantity`)}
                            placeholder="Qty"
                            className={`w-full px-3 py-2 border rounded-lg text-sm text-right text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.items?.[index]?.quantity ? 'border-red-400' : 'border-gray-200'}`}
                          />
                          {errors.items?.[index]?.quantity && <p className="text-xs text-red-500 mt-1">{errors.items[index].quantity.message}</p>}
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <input
                            type="number" step="0.01"
                            {...register(`items.${index}.price`)}
                            placeholder="0.00"
                            className={`w-full px-3 py-2 border rounded-lg text-sm text-right text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.items?.[index]?.price ? 'border-red-400' : 'border-gray-200'}`}
                          />
                          {errors.items?.[index]?.price && <p className="text-xs text-red-500 mt-1">{errors.items[index].price.message}</p>}
                        </div>
                        <div className="col-span-3 md:col-span-2">
                          <input
                            type="number" step="0.01"
                            {...register(`items.${index}.taxPercent`)}
                            placeholder="0"
                            className={`w-full px-3 py-2 border rounded-lg text-sm text-right text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors.items?.[index]?.taxPercent ? 'border-red-400' : 'border-gray-200'}`}
                          />
                          {errors.items?.[index]?.taxPercent && <p className="text-xs text-red-500 mt-1">{errors.items[index].taxPercent.message}</p>}
                        </div>
                        <div className="col-span-1 md:col-span-1 flex items-center justify-end h-10">
                          <span className="text-sm font-semibold text-gray-700 hidden md:block">₹{lineTotal.toFixed(0)}</span>
                        </div>
                        <div className="col-span-1 flex items-center justify-end h-10">
                          {fields.length > 1 && (
                            <button type="button" onClick={() => remove(index)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => append({ name: '', description: '', quantity: 1, price: 0, taxPercent: 0 })}
                className="mt-4 flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>

              {errors.items && typeof errors.items.message === 'string' && (
                <p className="mt-2 text-xs text-red-500">{errors.items.message}</p>
              )}
            </Card>

            {/* Notes */}
            <Card>
              <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Notes / Terms</label>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="Payment terms, thank you note, bank details, etc."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <Card>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Summary</h3>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Tax Amount</span>
                    <span>₹{totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t-2 border-gray-100 pt-3 mt-1 flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-lg">₹{totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </Card>

              <div className="flex flex-col gap-2">
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
