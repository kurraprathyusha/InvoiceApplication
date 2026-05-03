import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, IndianRupee, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardStats } from '../api/dashboard';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <Card className="flex items-center gap-4 !p-5">
    <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return <div className="p-8 text-center text-gray-500">Failed to load dashboard data.</div>;

  const PIE_COLORS = { PAID: '#10B981', PENDING: '#F59E0B', UNPAID: '#EF4444' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Here's what's happening with your business.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={IndianRupee} label="Total Revenue"   value={`₹${Number(stats.totalRevenue).toFixed(2)}`}  color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={Clock}       label="Pending Amount"  value={`₹${Number(stats.pendingAmount).toFixed(2)}`} color="text-amber-600"   bg="bg-amber-50"   />
        <StatCard icon={FileText}    label="Total Invoices"  value={stats.totalInvoices}                          color="text-primary"     bg="bg-primary-50" />
        <StatCard icon={Users}       label="Customers"       value={stats.totalCustomers}                         color="text-violet-600"  bg="bg-violet-50"  />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Revenue Overview</h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" /> Revenue
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.revenueByMonth} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={v => `₹${v}`} width={60} />
              <Tooltip
                cursor={{ fill: '#f9fafb', radius: 4 }}
                contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)', fontSize: 13 }}
                formatter={v => [`₹${v}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#4F46E5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900">Invoice Status</h3>
            <p className="text-xs text-gray-400 mt-0.5">Distribution by status</p>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={stats.statusDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="count">
                {stats.statusDistribution.map(entry => (
                  <Cell key={entry.status} fill={PIE_COLORS[entry.status] || '#9CA3AF'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 mt-1">
            {stats.statusDistribution.map(entry => (
              <div key={entry.status} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[entry.status] }} />
                  <span className="text-gray-600">{entry.status}</span>
                </div>
                <span className="font-semibold text-gray-900">{entry.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Recent Invoices</h3>
            <p className="text-xs text-gray-400 mt-0.5">Latest 5 invoices</p>
          </div>
          <Link to="/invoices" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {stats.recentInvoices.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">No invoices yet. <Link to="/invoices/new" className="text-primary font-medium">Create one</Link></p>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Invoice', 'Customer', 'Amount', 'Status'].map(h => (
                    <th key={h} className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentInvoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 pr-6 text-sm font-medium text-primary">
                      <Link to={`/invoices/${invoice.id}`}>{invoice.invoiceNumber}</Link>
                    </td>
                    <td className="py-3.5 pr-6 text-sm text-gray-600">{invoice.customer?.name}</td>
                    <td className="py-3.5 pr-6 text-sm font-semibold text-gray-900">₹{Number(invoice.totalAmount).toFixed(2)}</td>
                    <td className="py-3.5"><StatusBadge status={invoice.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
