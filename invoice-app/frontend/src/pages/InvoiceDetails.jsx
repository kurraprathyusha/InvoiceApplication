import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, CreditCard, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getInvoice, updateInvoiceStatus } from '../api/invoices';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import StatusBadge from '../components/ui/StatusBadge';

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchInvoice(); }, [id]);

  const fetchInvoice = async () => {
    try {
      const data = await getInvoice(id);
      setInvoice(data);
    } catch {
      toast.error('Failed to load invoice');
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      await updateInvoiceStatus(id, 'PAID');
      toast.success('Invoice marked as paid');
      fetchInvoice();
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <Spinner />;
  if (!invoice) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/invoices')} className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Created {new Date(invoice.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {invoice.status !== 'PAID' && (
            <Button onClick={handleMarkAsPaid} variant="success">
              <CreditCard className="w-4 h-4 mr-1.5" /> Mark as Paid
            </Button>
          )}
          <Button onClick={() => navigate(`/invoices/${id}/edit`)} variant="secondary">
            <Edit2 className="w-4 h-4 mr-1.5" /> Edit
          </Button>
          <Button onClick={() => window.print()} variant="secondary">
            <Printer className="w-4 h-4 mr-1.5" /> Print
          </Button>
        </div>
      </div>

      {/* Invoice document */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 sm:p-12 print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between mb-10 gap-6">
          <div>
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-3">
              <span className="text-white font-bold text-sm">IP</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">INVOICE</h2>
            <p className="text-gray-400 text-sm mt-1">{invoice.invoiceNumber}</p>
          </div>
          <div className="text-left sm:text-right space-y-1">
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Invoice Date</span>
              <p className="text-sm font-medium text-gray-900">{new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="mt-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Due Date</span>
              <p className="text-sm font-medium text-gray-900">{new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* From / To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10 p-6 bg-gray-50/70 rounded-xl">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">From</p>
            <p className="font-semibold text-gray-900">{user?.companyName || user?.name}</p>
            {user?.address && <p className="text-sm text-gray-500 mt-1 whitespace-pre-line">{user.address}</p>}
            <p className="text-sm text-gray-500">{user?.email}</p>
            {user?.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Bill To</p>
            <p className="font-semibold text-gray-900">{invoice.customer?.name}</p>
            {invoice.customer?.address && <p className="text-sm text-gray-500 mt-1 whitespace-pre-line">{invoice.customer.address}</p>}
            <p className="text-sm text-gray-500">{invoice.customer?.email}</p>
            {invoice.customer?.phone && <p className="text-sm text-gray-500">{invoice.customer.phone}</p>}
            {invoice.customer?.gstNumber && <p className="text-sm text-gray-500 mt-1">GST: {invoice.customer.gstNumber}</p>}
          </div>
        </div>

        {/* Items table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Item</th>
                <th className="py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Qty</th>
                <th className="py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Price</th>
                <th className="py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Tax %</th>
                <th className="py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item, index) => (
                <tr key={item.id || index} className="border-b border-gray-50">
                  <td className="py-4">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    {item.description && <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>}
                  </td>
                  <td className="py-4 text-right text-sm text-gray-600">{item.quantity}</td>
                  <td className="py-4 text-right text-sm text-gray-600">₹{Number(item.price).toFixed(2)}</td>
                  <td className="py-4 text-right text-sm text-gray-600">{Number(item.taxPercent).toFixed(2)}%</td>
                  <td className="py-4 text-right text-sm font-semibold text-gray-900">₹{Number(item.lineTotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-full sm:w-72 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span><span>₹{Number(invoice.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tax Amount</span><span>₹{Number(invoice.taxAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 border-t-2 border-gray-200 pt-3 mt-2">
              <span>Total Amount</span><span>₹{Number(invoice.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="border-t border-gray-100 pt-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Notes / Terms</p>
            <p className="text-sm text-gray-500 whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetails;
