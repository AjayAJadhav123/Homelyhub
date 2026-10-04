import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { axiosInstance } from "../../../utils/axios";
import LoadingSpinner from "../../LoadingSpinner";
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, Title, Tooltip, Legend, BarElement 
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import "./OwnerAnalytics.css";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, Title, Tooltip, Legend
);

const OwnerAnalytics = () => {
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axiosInstance.get("/v1/rent/analytics");
        setData(res.data.data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) {
      fetchAnalytics();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) {
    return <div className="mt-5 text-center">Please login to view analytics.</div>;
  }

  if (loading) return <div className="mt-5 text-center"><LoadingSpinner /></div>;
  if (!data) return <div className="mt-5 text-center">Failed to load analytics data.</div>;

  const { overview, inquiries, topProperties, monthlyTrends } = data;

  const trendData = {
    labels: monthlyTrends.map(t => t.month),
    datasets: [
      {
        label: "Bookings",
        data: monthlyTrends.map(t => t.bookings),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        yAxisID: "y",
      },
      {
        label: "Revenue (₹)",
        data: monthlyTrends.map(t => t.revenue),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        yAxisID: "y1",
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    interaction: { mode: "index", intersect: false },
    scales: {
      y: { type: "linear", display: true, position: "left", title: { display: true, text: "Bookings" } },
      y1: { type: "linear", display: true, position: "right", title: { display: true, text: "Revenue" }, grid: { drawOnChartArea: false } },
    },
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="stat-info">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );

  return (
    <div className="analytics-container">
      <h1 className="analytics-header">Owner Analytics Dashboard</h1>
      
      <div className="stats-grid">
        <StatCard title="Total Views" value={overview.views} icon="visibility" color="blue" />
        <StatCard title="Total Favorites" value={overview.favorites} icon="favorite" color="red" />
        <StatCard title="Total Bookings" value={overview.bookings} icon="bookmark_added" color="green" />
        <StatCard title="Total Revenue" value={`₹${overview.revenue.toLocaleString()}`} icon="payments" color="green" />
        <StatCard title="Total Inquiries" value={overview.inquiries} icon="mail" color="purple" />
        <StatCard title="Conversion Rate" value={`${overview.conversionRate}%`} icon="percent" color="orange" />
      </div>

      <div className="charts-container row">
        <div className="col-md-8 col-sm-12 chart-box">
          <h4 className="chart-title">Revenue & Bookings Trend (Last 6 Months)</h4>
          {monthlyTrends.length > 0 ? (
            <Line options={trendOptions} data={trendData} />
          ) : (
            <p className="no-data">No data available for the last 6 months.</p>
          )}
        </div>
        
        <div className="col-md-4 col-sm-12 chart-box">
          <h4 className="chart-title">Inquiry Status</h4>
          <div className="inquiry-stats">
            <div className="inquiry-stat-item">
              <span>Accepted</span>
              <span className="badge bg-success">{inquiries.accepted}</span>
            </div>
            <div className="inquiry-stat-item">
              <span>Rejected</span>
              <span className="badge bg-danger">{inquiries.rejected}</span>
            </div>
            <div className="inquiry-stat-item">
              <span>Pending</span>
              <span className="badge bg-warning text-dark">{inquiries.pending}</span>
            </div>
            <div className="inquiry-stat-total">
              <span>Total Inquiries</span>
              <strong>{inquiries.total}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="top-properties-section">
        <h4 className="chart-title">Top Performing Properties (By Revenue)</h4>
        {topProperties.length > 0 ? (
          <div className="table-responsive">
            <table className="table analytics-table">
              <thead>
                <tr>
                  <th>Property Name</th>
                  <th>Views</th>
                  <th>Bookings</th>
                  <th>Revenue</th>
                  <th>Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {topProperties.map(p => (
                  <tr key={p._id}>
                    <td><strong>{p.propertyName}</strong></td>
                    <td>{p.views}</td>
                    <td>{p.bookings}</td>
                    <td>₹{p.revenue.toLocaleString()}</td>
                    <td>{p.conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">You have no booking data yet.</p>
        )}
      </div>
    </div>
  );
};

export default OwnerAnalytics;
