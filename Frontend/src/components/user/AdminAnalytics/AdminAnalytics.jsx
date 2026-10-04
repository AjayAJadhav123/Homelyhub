import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { axiosInstance } from "../../../utils/axios";
import LoadingSpinner from "../../LoadingSpinner";
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, Title, Tooltip, Legend, BarElement 
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import "./AdminAnalytics.css";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, Title, Tooltip, Legend
);

const AdminAnalytics = () => {
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axiosInstance.get("/v1/rent/analytics/admin");
        setData(res.data.data);
      } catch (err) {
        console.error("Error fetching admin analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated && user?.role === "admin") {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user || user.role !== "admin") {
    return (
      <div className="mt-5 text-center p-5">
        <h2 className="text-danger">Access Denied</h2>
        <p>You do not have permission to view the Admin Dashboard.</p>
      </div>
    );
  }

  if (loading) return <div className="mt-5 text-center"><LoadingSpinner /></div>;
  if (!data) return <div className="mt-5 text-center">Failed to load admin analytics data.</div>;

  const { overview, trends, popularProperties } = data;

  const revenueBookingsData = {
    labels: trends.map(t => t.month),
    datasets: [
      {
        label: "Bookings",
        data: trends.map(t => t.bookings),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        yAxisID: "y",
      },
      {
        label: "Revenue (₹)",
        data: trends.map(t => t.revenue),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        yAxisID: "y1",
      },
    ],
  };

  const usersInquiriesData = {
    labels: trends.map(t => t.month),
    datasets: [
      {
        label: "New Users",
        data: trends.map(t => t.newUsers),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
      {
        label: "Inquiries",
        data: trends.map(t => t.inquiries),
        backgroundColor: "rgba(255, 159, 64, 0.6)",
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    interaction: { mode: "index", intersect: false },
    scales: {
      y: { type: "linear", display: true, position: "left" },
      y1: { type: "linear", display: true, position: "right", grid: { drawOnChartArea: false } },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
    },
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="admin-stat-card">
      <div className={`admin-stat-icon ${color}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="admin-stat-info">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );

  return (
    <div className="admin-analytics-container">
      <h1 className="admin-analytics-header">Platform Admin Dashboard</h1>
      
      <div className="admin-stats-grid">
        <StatCard title="Total Users" value={overview.totalUsers} icon="group" color="purple" />
        <StatCard title="Total Properties" value={overview.totalProperties} icon="real_estate_agent" color="blue" />
        <StatCard title="Total Bookings" value={overview.totalBookings} icon="event_available" color="green" />
        <StatCard title="Total Revenue" value={`₹${overview.totalRevenue.toLocaleString()}`} icon="account_balance_wallet" color="green" />
        <StatCard title="Pending Inquiries" value={overview.pendingInquiries} icon="pending_actions" color="orange" />
      </div>

      <div className="admin-charts-container row">
        <div className="col-md-6 col-sm-12 admin-chart-box">
          <h4 className="admin-chart-title">Revenue & Bookings (Last 6 Months)</h4>
          {trends.length > 0 ? (
            <Line options={trendOptions} data={revenueBookingsData} />
          ) : (
            <p className="admin-no-data">No data available.</p>
          )}
        </div>
        
        <div className="col-md-6 col-sm-12 admin-chart-box">
          <h4 className="admin-chart-title">Platform Growth</h4>
          {trends.length > 0 ? (
            <Bar options={barOptions} data={usersInquiriesData} />
          ) : (
            <p className="admin-no-data">No data available.</p>
          )}
        </div>
      </div>

      <div className="admin-top-section">
        <h4 className="admin-chart-title">Most Popular Properties</h4>
        {popularProperties.length > 0 ? (
          <div className="table-responsive">
            <table className="table admin-analytics-table">
              <thead>
                <tr>
                  <th>Property Name</th>
                  <th>Location</th>
                  <th>Total Bookings</th>
                </tr>
              </thead>
              <tbody>
                {popularProperties.map(p => (
                  <tr key={p._id}>
                    <td><strong>{p.propertyName}</strong></td>
                    <td>{p.location}</td>
                    <td><span className="badge bg-primary">{p.bookings} bookings</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="admin-no-data">No bookings recorded yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
