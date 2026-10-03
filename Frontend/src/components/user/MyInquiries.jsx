import React, { useEffect, useState, useCallback } from "react";
import { Tabs, List, Tag, Card, Button, Popconfirm } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { axiosInstance } from "../../utils/axios";
import LoadingSpinner from "../LoadingSpinner";
import { Link } from "react-router-dom";
import moment from "moment";
import toast from "react-hot-toast";

/* ─── helpers ──────────────────────────────────────────────────── */
const statusColor = (s) => {
  if (s === "accepted") return "success";
  if (s === "rejected") return "error";
  if (s === "pending") return "warning";
  return "default";
};

const MyInquiries = () => {
  const [sentInquiries, setSentInquiries] = useState([]);
  const [receivedInquiries, setReceivedInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({}); // { [inquiryId]: bool }

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      const [sentRes, receivedRes] = await Promise.all([
        axiosInstance.get("/v1/rent/user/inquiries/sent"),
        axiosInstance.get("/v1/rent/user/inquiries/received"),
      ]);
      setSentInquiries(sentRes.data.data);
      setReceivedInquiries(receivedRes.data.data);
    } catch (error) {
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  /* ── owner action: accept or reject ── */
  const handleStatusUpdate = async (inquiryId, newStatus) => {
    // Mark this specific inquiry as in-flight — disables both its buttons
    setActionLoading((prev) => ({ ...prev, [inquiryId]: true }));
    try {
      const res = await axiosInstance.patch(
        `/v1/rent/user/inquiries/${inquiryId}/status`,
        { status: newStatus }
      );
      // Use the status returned by the server — not the value we sent
      const confirmedStatus = res.data.data.status;
      setReceivedInquiries((prev) =>
        prev.map((inq) =>
          inq._id === inquiryId ? { ...inq, status: confirmedStatus } : inq
        )
      );
      toast.success(`Inquiry ${confirmedStatus} successfully.`);
    } catch (err) {
      // State is NOT touched on error — PENDING status is preserved in the UI
      const msg =
        err?.response?.data?.message || "Failed to update inquiry status.";
      toast.error(msg);
    } finally {
      // Always clear the loading flag so buttons re-enable if request failed
      setActionLoading((prev) => ({ ...prev, [inquiryId]: false }));
    }
  };

  /* ─── Sent tab ─────────────────────────────────────────────── */
  const renderSentInquiries = () => {
    if (sentInquiries.length === 0)
      return (
        <p className="text-muted mt-3">You haven&apos;t sent any inquiries yet.</p>
      );

    return (
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1 }}
        dataSource={sentInquiries}
        renderItem={(item) => (
          <List.Item>
            <Card
              title={
                item.property ? (
                  <Link to={`/propertylist/${item.property._id}`}>
                    {item.property.propertyName}
                  </Link>
                ) : (
                  <span className="text-muted">[Property removed]</span>
                )
              }
              extra={
                <Tag color={statusColor(item.status)}>
                  {item.status.toUpperCase()}
                </Tag>
              }
              style={{ borderRadius: "0.75rem" }}
            >
              <p>
                <strong>To:</strong>{" "}
                {item.owner ? item.owner.name : "—"}
              </p>
              <p>
                <strong>Message:</strong> {item.message}
              </p>
              <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                Sent: {moment(item.createdAt).format("MMM Do YYYY, h:mm a")}
              </p>
            </Card>
          </List.Item>
        )}
      />
    );
  };

  /* ─── Received tab ─────────────────────────────────────────── */
  const renderReceivedInquiries = () => {
    if (receivedInquiries.length === 0)
      return (
        <p className="text-muted mt-3">
          No inquiries received for your properties.
        </p>
      );

    return (
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1 }}
        dataSource={receivedInquiries}
        renderItem={(item) => {
          const isPending = item.status === "pending";
          const isActing = !!actionLoading[item._id];

          return (
            <List.Item>
              <Card
                title={
                  item.property ? (
                    <Link to={`/propertylist/${item.property._id}`}>
                      {item.property.propertyName}
                    </Link>
                  ) : (
                    <span className="text-muted">[Property removed]</span>
                  )
                }
                extra={
                  <Tag color={statusColor(item.status)}>
                    {item.status.toUpperCase()}
                  </Tag>
                }
                style={{ borderRadius: "0.75rem" }}
                actions={
                  isPending
                    ? [
                        <Popconfirm
                          key="accept"
                          title="Accept this inquiry?"
                          okText="Yes, Accept"
                          cancelText="Cancel"
                          onConfirm={() =>
                            handleStatusUpdate(item._id, "accepted")
                          }
                        >
                          <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            loading={isActing}
                            style={{
                              background: "#0e8b53",
                              borderColor: "#0e8b53",
                            }}
                          >
                            Accept
                          </Button>
                        </Popconfirm>,
                        <Popconfirm
                          key="reject"
                          title="Reject this inquiry?"
                          okText="Yes, Reject"
                          cancelText="Cancel"
                          onConfirm={() =>
                            handleStatusUpdate(item._id, "rejected")
                          }
                        >
                          <Button
                            danger
                            icon={<CloseCircleOutlined />}
                            loading={isActing}
                          >
                            Reject
                          </Button>
                        </Popconfirm>,
                      ]
                    : [
                        <span
                          key="done"
                          style={{
                            color:
                              item.status === "accepted" ? "#0e8b53" : "#cf1322",
                            fontWeight: 600,
                          }}
                        >
                          {item.status === "accepted" ? "✓ Accepted" : "✕ Rejected"}
                        </span>,
                      ]
                }
              >
                <p>
                  <strong>From:</strong>{" "}
                  {item.sender ? `${item.sender.name} (${item.sender.email})` : "—"}
                </p>
                <p>
                  <strong>Message:</strong> {item.message}
                </p>
                <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                  Received: {moment(item.createdAt).format("MMM Do YYYY, h:mm a")}
                </p>
              </Card>
            </List.Item>
          );
        }}
      />
    );
  };

  if (loading) return <LoadingSpinner />;

  const items = [
    {
      key: "1",
      label: `Sent Inquiries (${sentInquiries.length})`,
      children: renderSentInquiries(),
    },
    {
      key: "2",
      label: `Received Inquiries (${receivedInquiries.length})`,
      children: renderReceivedInquiries(),
    },
  ];

  return (
    <div className="container mt-5 mb-5">
      <h2 className="mb-4">My Inquiries</h2>
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};

export default MyInquiries;
