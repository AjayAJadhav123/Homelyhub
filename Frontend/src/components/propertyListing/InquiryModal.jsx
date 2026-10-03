import React, { useState } from "react";
import { Modal, Input, Button, Form } from "antd";
import { axiosInstance } from "../../utils/axios";
import toast from "react-hot-toast";

const InquiryModal = ({ visible, onClose, propertyId, propertyName }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSendInquiry = async (values) => {
    try {
      setLoading(true);
      await axiosInstance.post(`/v1/rent/user/inquiries/${propertyId}`, {
        message: values.message,
      });
      toast.success("Inquiry sent successfully to the property owner.");
      form.resetFields();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send inquiry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Contact Owner for ${propertyName}`}
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSendInquiry}
        className="mt-4"
      >
        <Form.Item
          name="message"
          label="Your Message"
          rules={[
            { required: true, message: "Please enter your message" },
            { min: 10, message: "Message must be at least 10 characters long" },
            { max: 1000, message: "Message cannot exceed 1000 characters" }
          ]}
        >
          <Input.TextArea 
            rows={4} 
            placeholder="Hi, I'm interested in this property. Could you tell me more about..." 
          />
        </Form.Item>
        <div className="d-flex justify-content-end mt-4">
          <Button onClick={onClose} className="me-2">
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} style={{ backgroundColor: "#ff385c" }}>
            Send Inquiry
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default InquiryModal;
