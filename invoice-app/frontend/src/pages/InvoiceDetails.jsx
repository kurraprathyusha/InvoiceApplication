import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, CreditCard } from 'lucide-react';
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

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const data = await getInvoice(id);
      setInvoice(data);
    } catch (error) {
      toast.error('Failed to load invoice');
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleMarkAsPaid = async () => {
    try {
      await updateInvoiceStatus(id, 'PAID');
      toast.success('Invoice marked as paid');
      fetchInvoice();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <Spinner />;
  if (!invoice) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/invoices')} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
          <StatusBadge status={invoice.status} />
        </div>
        <div className="flex gap-2">
          {invoice.status !== 'PAID' && (
            <Button onClick={handleMarkAsPaid} variant="success" className="bg-success hover:bg-green-600 text-white border-transparent">
              <CreditCard className="w-4 h-4 mr-2" /> Mark as Paid
            </Button>
          )}
          <Button onClick={handlePrint} variant="secondary">
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 print:shadow-none print:border-none print:p-0">
        <div className="flex flex-col sm:flex-row justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h2>
            <p className="text-gray-500">{invoice.invoiceNumber}</p>
          </div>
          <div className="mt-4 sm:mt-0 text-left sm:text-right">
            <p className="font-medium text-gray-900">Invoice Date:</p>
            <p className="text-gray-500 mb-2">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
            <p className="font-medium text-gray-900">Due Date:</p>
            <p className="text-gray-500">{new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
          <div>
            <p className="font-semibold text-gray-900 mb-2">From:</p>
            <p className="text-gray-700 font-medium">{user?.companyName || user?.name}</p>
            <p className="text-gray-500 whitespace-pre-line">{user?.address}</p>
            <p className="text-gray-500">{user?.email}</p>
            <p className="text-gray-500">{user?.phone}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-2">Bill To:</p>
            <p className="text-gray-700 font-medium">{invoice.customer.name}</p>
            {invoice.customer.companyName && <p className="text-gray-700">{invoice.customer.companyName}</p>}
            <p className="text-gray-500 whitespace-pre-line">{invoice.customer.address}</p>
            <p className="text-gray-500">{invoice.customer.email}</p>
            <p className="text-gray-500">{invoice.customer.phone}</p>
            {invoice.customer.gstNumber && <p className="text-gray-500">GST: {invoice.customer.gstNumber}</p>}
          </div>
        </div>

        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-3 font-semibold text-gray-900">Description</th>
                <th className="py-3 font-semibold text-gray-900 text-right">Qty</th>
                <th className="py-3 font-semibold text-gray-900 text-right">Price</th>
                <th className="py-3 font-semibold text-gray-900 text-right">Tax %</th>
                <th className="py-3 font-semibold text-gray-900 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={item.id || index} className="border-b border-gray-100">
                  <td className="py-4">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
                  </td>
                  <td className="py-4 text-right text-gray-700">{item.quantity}</td>
                  <td className="py-4 text-right text-gray-700">₹{item.price?.toFixed(2)}</td>
                  <td className="py-4 text-right text-gray-700">{item.taxPercent?.toFixed(2)}%</td>
                  <td className="py-4 text-right font-medium text-gray-900">₹{item.lineTotal?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-8">
          <div className="w-full sm:w-1/2 lg:w-1/3 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{invoice.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax Amount</span>
              <span>₹{invoice.taxAmount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t-2 border-gray-200 pt-3 text-lg font-bold text-gray-900">
              <span>Total Amount</span>
              <span>₹{invoice.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="border-t border-gray-200 pt-8 text-gray-500 whitespace-pre-line text-sm">
            <p className="font-medium text-gray-700 mb-1">Notes / Terms:</p>
            {invoice.notes}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetails;
