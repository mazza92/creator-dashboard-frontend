import React, { useState, useEffect, useContext, useCallback } from 'react';
import { UserContext } from "../contexts/UserContext";
import axios from 'axios';
import { Button, Spin, Select, Input, Form, Modal, Row, Col, Tooltip, notification, Space, Tag, InputNumber } from 'antd';
import { FiPlus, FiEdit2, FiTrash2, FiCopy } from 'react-icons/fi';
import { FaInstagram, FaYoutube, FaTwitter, FaLinkedin, FaSnapchat, FaPinterest, FaTwitch, FaFacebookF, FaTiktok } from 'react-icons/fa';
import { MdOutlineLiveTv, MdOutlineAudiotrack, MdImage, MdVideoCameraFront, MdCameraAlt, MdMovie, MdFileCopy, MdEmail } from 'react-icons/md';
import styled from 'styled-components';
import './ManagePackages.css';

const { Option } = Select;
const { TextArea } = Input;

const Container = styled.div`
  padding: 32px;
  background: #f5f7fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
`;

const PackageCard = styled.div`
  background: white;
  border: 1px solid #e8ecef;
  border-radius: 12px;
  padding: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  }
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
`;

const CardContent = styled.div`
  font-size: 14px;
  color: #595959;
`;

const FAB = styled(Button)`
  position: fixed;
  bottom: 32px;
  right: 32px;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const DeliverableTag = styled(Tag)`
  margin: 4px 8px 4px 0;
  border-radius: 16px;
  padding: 2px 8px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const ActionButton = styled(Button)`
  border: none;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const platformLogos = {
  Instagram: <FaInstagram style={{ color: '#E1306C' }} />,
  YouTube: <FaYoutube style={{ color: '#FF0000' }} />,
  Twitter: <FaTwitter style={{ color: '#1DA1F2' }} />,
  LinkedIn: <FaLinkedin style={{ color: '#0077B5' }} />,
  Snapchat: <FaSnapchat style={{ color: '#FFFC00' }} />,
  Pinterest: <FaPinterest style={{ color: '#E60023' }} />,
  Twitch: <FaTwitch style={{ color: '#9146FF' }} />,
  Facebook: <FaFacebookF style={{ color: '#1877F2' }} />,
  TikTok: <FaTiktok style={{ color: '#000000' }} />,
};

const contentIcons = {
  'Static Posts': <MdImage />,
  'Stories': <MdVideoCameraFront />,
  'Short Videos': <MdCameraAlt />,
  '10min+ Videos': <MdMovie />,
  'Live Streaming': <MdOutlineLiveTv />,
  'User-Generated Content': <MdFileCopy />,
  'Audio Content': <MdOutlineAudiotrack />,
  'Newsletter': <MdEmail />,
};

function ManagePackages() {
  const { user } = useContext(UserContext);
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isRecapModalVisible, setIsRecapModalVisible] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [editForm] = Form.useForm();
  const [createForm] = Form.useForm();
  const [offerData, setOfferData] = useState({
    package_name: '',
    deliverables: [],
    frequency: 'monthly',
    description: '',
    price: null,
  });

  const fetchPackages = useCallback(async () => {
    try {
      if (!user?.id) {
        console.error("❌ No user ID available in context");
        notification.error({ message: 'Authentication required', description: 'Please log in to view packages' });
        setIsLoading(false);
        return;
      }
      console.log("📌 Fetching packages for creator_id from session");
      setIsLoading(true);
      const response = await axios.get('http://localhost:5000/my-subscription-packages', { withCredentials: true });
      console.log("🟢 Fetched Packages Response:", response.data);
      setPackages(response.data || []);
    } catch (error) {
      console.error("❌ Error fetching packages:", error);
      notification.error({ message: 'Failed to fetch packages', description: error.message });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) fetchPackages();
  }, [user, fetchPackages]);

  const getTagColor = (contentType) => {
    switch (contentType) {
      case 'Stories': return 'orange';
      case 'Live Streaming': return 'green';
      case 'Static Posts': return 'purple';
      case 'Short Videos': return 'pink';
      case '10min+ Videos': return 'blue';
      case 'User-Generated Content': return 'volcano';
      case 'Audio Content': return 'brown';
      case 'Newsletter': return 'gold';
      default: return 'gray';
    }
  };

  const updatePackageStatus = async (id, status) => {
    try {
        await axios.put(`http://localhost:5000/packages/${id}/status`, { status }, { withCredentials: true });
        setPackages(packages.map(pkg => (pkg.id === id ? { ...pkg, status } : pkg)));
    } catch (error) {
        notification.error({ message: 'Failed to update status', description: error.message });
    }
};
  const deletePackage = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/creators/${user.id}/subscription-packages/${id}`, { withCredentials: true });
      setPackages(packages.filter(pkg => pkg.id !== id));
      notification.success({ message: 'Package deleted' });
    } catch (error) {
      notification.error({ message: 'Failed to delete', description: error.message });
    }
  };

  const openEditModal = (pkg) => {
    setCurrentPackage(pkg);
    editForm.setFieldsValue({
      package_name: pkg.package_name,
      description: pkg.description,
      price: pkg.price,
      frequency: pkg.frequency || 'monthly',
    });
    setOfferData({
      package_name: pkg.package_name,
      deliverables: pkg.deliverables || [],
      frequency: pkg.frequency || 'monthly',
      description: pkg.description,
      price: pkg.price,
    });
    setIsEditing(true);
  };

  const openCreateModal = () => {
    createForm.resetFields();
    setOfferData({ package_name: '', deliverables: [], frequency: 'monthly', description: '', price: null });
    setIsCreating(true);
  };

  const handleReviewAndPublish = () => setIsRecapModalVisible(true);

  const handleEditSubmit = async () => {
    try {
        const updatedPackage = editForm.getFieldsValue();
        const payload = {
            ...updatedPackage,
            deliverables: offerData.deliverables,
        };
        console.log("🟢 Sending PUT Payload for Package Update:", payload);
        const response = await axios.put(
            `http://localhost:5000/packages/${currentPackage.id}`, 
            payload, 
            { withCredentials: true }
        );
        console.log("🟢 Update Response:", response.data);
        notification.success({ message: 'Package updated' });
        setIsEditing(false);
        await fetchPackages();
    } catch (error) {
        notification.error({ message: 'Failed to update', description: error.message });
        console.error("❌ Error updating package:", error);
    }
};

const handleCreateSubmit = async () => {
  try {
    await createForm.validateFields();
    const formData = createForm.getFieldsValue();
    const payload = { ...formData, ...offerData };
    console.log("🟢 Sending POST Payload for Package Creation:", payload);
    const response = await axios.post(
      'http://localhost:5000/create-subscription-package',
      payload,
      { withCredentials: true }
    );
    console.log("🟢 Package Creation Response:", response.data);
    notification.success({ message: 'Package created' });
    setIsRecapModalVisible(false);
    setIsCreating(false);
    createForm.resetFields();
    setOfferData({ package_name: '', deliverables: [], frequency: 'monthly', description: '', price: null });
    await fetchPackages(); // Ensure this runs after creation
  } catch (error) {
    if (error.response) {
      notification.error({ message: 'Failed to create', description: error.response.data.error });
      console.error("❌ Error creating package:", error.response.data);
    } else {
      notification.error({ message: 'Validation failed', description: 'Please fill in all required fields' });
      console.error("❌ Validation error:", error);
    }
  }
};

  const addDeliverable = () => {
    setOfferData({
      ...offerData,
      deliverables: [...offerData.deliverables, { type: '', quantity: 1, platform: '' }],
    });
  };

  const duplicateDeliverable = (index) => {
    const deliverableToCopy = offerData.deliverables[index];
    setOfferData({
      ...offerData,
      deliverables: [...offerData.deliverables, { ...deliverableToCopy }],
    });
  };

  const updateDeliverable = (index, field, value) => {
    const updatedDeliverables = offerData.deliverables.map((d, i) =>
      i === index ? { ...d, [field]: value } : d
    );
    setOfferData({ ...offerData, deliverables: updatedDeliverables });
  };

  const removeDeliverable = (index) => {
    setOfferData({
      ...offerData,
      deliverables: offerData.deliverables.filter((_, i) => i !== index),
    });
  };

  if (isLoading) {
    return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;
  }

  return (
    <Container>
      <Header>
        <Title>Your Subscription Packages</Title>
      </Header>
      <Row gutter={[24, 24]}>
        {packages.length === 0 ? (
          <Col span={24}>
            <p style={{ textAlign: 'center', color: '#8c8c8c' }}>No packages yet. Create one to get started!</p>
          </Col>
        ) : (
          packages.map(pkg => (
            <Col xs={24} md={12} lg={8} key={pkg.id}>
              <PackageCard>
                <CardTitle>{pkg.package_name}</CardTitle>
                <CardContent>
                  <div style={{ marginBottom: 12 }}>
                    {(pkg.deliverables || []).map((item, index) => (
                      <DeliverableTag key={index} color={getTagColor(item.type)}>
                        {contentIcons[item.type]} {item.quantity}x {item.type} ({platformLogos[item.platform]} {item.platform})
                      </DeliverableTag>
                    ))}
                  </div>
                  <p><strong>Freq:</strong> {pkg.frequency || 'monthly'}</p>
                  <p><strong>Price:</strong> ${pkg.price} / mo</p>
                  <p style={{ color: '#8c8c8c', fontSize: '12px' }}>{pkg.description}</p>
                </CardContent>
                <Space style={{ marginTop: 12, justifyContent: 'space-between', width: '100%' }}>
                  <Select
                    value={pkg.status}
                    style={{ width: 100 }}
                    onChange={(value) => updatePackageStatus(pkg.id, value)}
                    size="small"
                  >
                    <Option value="active"><Tag color="green">Active</Tag></Option>
                    <Option value="paused"><Tag color="orange">Paused</Tag></Option>
                    <Option value="inactive"><Tag color="red">Inactive</Tag></Option>
                  </Select>
                  <Space>
                    <Tooltip title="Edit">
                      <ActionButton icon={<FiEdit2 />} onClick={() => openEditModal(pkg)} />
                    </Tooltip>
                    <Tooltip title="Delete">
                      <ActionButton icon={<FiTrash2 />} danger onClick={() => deletePackage(pkg.id)} />
                    </Tooltip>
                  </Space>
                </Space>
              </PackageCard>
            </Col>
          ))
        )}
      </Row>
      <FAB type="primary" icon={<FiPlus />} onClick={openCreateModal} />

      {/* Edit Modal */}
      <Modal
        title={<span style={{ fontSize: '18px', fontWeight: 600 }}>Edit Subscription Package</span>}
        open={isEditing}
        onCancel={() => setIsEditing(false)}
        onOk={handleEditSubmit}
        okText="Save"
        bodyStyle={{ padding: '16px' }}
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item label="Name" name="package_name" rules={[{ required: true, message: 'Enter a name' }]}>
            <Input placeholder="e.g., Multi-Platform Bundle" />
          </Form.Item>
          <Form.Item label="Deliverables" rules={[{ required: true, message: 'Add at least one deliverable' }]}>
            {offerData.deliverables.map((deliv, index) => (
              <Row gutter={8} key={index} style={{ marginBottom: 8 }}>
                <Col span={8}>
                  <Select
                    placeholder="Type"
                    value={deliv.type}
                    onChange={(value) => updateDeliverable(index, 'type', value)}
                  >
                    {Object.keys(contentIcons).map(type => (
                      <Option key={type} value={type}>{contentIcons[type]} {type}</Option>
                    ))}
                  </Select>
                </Col>
                <Col span={5}>
                  <InputNumber
                    min={1}
                    value={deliv.quantity}
                    onChange={(value) => updateDeliverable(index, 'quantity', value)}
                    placeholder="Qty"
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col span={8}>
                  <Select
                    placeholder="Platform"
                    value={deliv.platform}
                    onChange={(value) => updateDeliverable(index, 'platform', value)}
                  >
                    {Object.keys(platformLogos).map(platform => (
                      <Option key={platform} value={platform}>{platformLogos[platform]} {platform}</Option>
                    ))}
                  </Select>
                </Col>
                <Col span={3}>
                  <Space>
                    <ActionButton icon={<FiCopy />} onClick={() => duplicateDeliverable(index)} />
                    <ActionButton icon={<FiTrash2 />} danger onClick={() => removeDeliverable(index)} />
                  </Space>
                </Col>
              </Row>
            ))}
            <Button type="dashed" onClick={addDeliverable} style={{ width: '100%' }} icon={<FiPlus />}>
              Add Deliverable
            </Button>
          </Form.Item>
          <Form.Item label="Frequency" name="frequency" rules={[{ required: true }]}>
            <Select>
              <Option value="monthly">Monthly</Option>
              <Option value="quarterly">Quarterly</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Description" name="description" rules={[{ required: true, message: 'Enter a description' }]}>
            <TextArea rows={3} placeholder="Describe your package..." />
          </Form.Item>
          <Form.Item label="Price ($/mo)" name="price" rules={[{ required: true, message: 'Enter a price' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g., 200" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Modal */}
      <Modal
        title={<span style={{ fontSize: '18px', fontWeight: 600 }}>New Subscription Package</span>}
        open={isCreating}
        onCancel={() => setIsCreating(false)}
        onOk={handleReviewAndPublish}
        okText="Next"
        bodyStyle={{ padding: '16px' }}
        width={600}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item label="Name" required>
            <Input
              name="package_name"
              value={offerData.package_name}
              onChange={(e) => setOfferData({ ...offerData, package_name: e.target.value })}
              placeholder="e.g., Multi-Platform Bundle"
            />
          </Form.Item>
          <Form.Item label="Deliverables" required>
            {offerData.deliverables.map((deliv, index) => (
              <Row gutter={8} key={index} style={{ marginBottom: 8 }}>
                <Col span={8}>
                  <Select
                    placeholder="Type"
                    value={deliv.type}
                    onChange={(value) => updateDeliverable(index, 'type', value)}
                  >
                    {Object.keys(contentIcons).map(type => (
                      <Option key={type} value={type}>{contentIcons[type]} {type}</Option>
                    ))}
                  </Select>
                </Col>
                <Col span={5}>
                  <InputNumber
                    min={1}
                    value={deliv.quantity}
                    onChange={(value) => updateDeliverable(index, 'quantity', value)}
                    placeholder="Qty"
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col span={8}>
                  <Select
                    placeholder="Platform"
                    value={deliv.platform}
                    onChange={(value) => updateDeliverable(index, 'platform', value)}
                  >
                    {Object.keys(platformLogos).map(platform => (
                      <Option key={platform} value={platform}>{platformLogos[platform]} {platform}</Option>
                    ))}
                  </Select>
                </Col>
                <Col span={3}>
                  <Space>
                    <ActionButton icon={<FiCopy />} onClick={() => duplicateDeliverable(index)} />
                    <ActionButton icon={<FiTrash2 />} danger onClick={() => removeDeliverable(index)} />
                  </Space>
                </Col>
              </Row>
            ))}
            <Button type="dashed" onClick={addDeliverable} style={{ width: '100%' }} icon={<FiPlus />}>
              Add Deliverable
            </Button>
          </Form.Item>
          <Form.Item label="Frequency" required>
            <Select
              value={offerData.frequency}
              onChange={(value) => setOfferData({ ...offerData, frequency: value })}
            >
              <Option value="monthly">Monthly</Option>
              <Option value="quarterly">Quarterly</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Description" required>
            <TextArea
              rows={3}
              value={offerData.description}
              onChange={(e) => setOfferData({ ...offerData, description: e.target.value })}
              placeholder="e.g., Monthly multi-platform content"
            />
          </Form.Item>
          <Form.Item label="Price ($/mo)" required>
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              value={offerData.price}
              onChange={(value) => setOfferData({ ...offerData, price: value })}
              placeholder="e.g., 200"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Recap Modal */}
      <Modal
        title={<span style={{ fontSize: '18px', fontWeight: 600 }}>Review & Publish</span>}
        open={isRecapModalVisible}
        onCancel={() => setIsRecapModalVisible(false)}
        onOk={handleCreateSubmit}
        okText="Publish"
        bodyStyle={{ padding: '16px' }}
        width={400}
      >
        <div style={{ fontSize: '14px', color: '#595959' }}>
          <p><strong>Name:</strong> {offerData.package_name || 'N/A'}</p>
          <p><strong>Deliverables:</strong> {offerData.deliverables.length > 0 ? offerData.deliverables.map(d => `${d.quantity}x ${d.type} (${d.platform})`).join(', ') : 'N/A'} per {offerData.frequency || 'month'}</p>
          <p><strong>Description:</strong> {offerData.description || 'N/A'}</p>
          <p><strong>Price:</strong> {offerData.price ? `$${offerData.price} / month` : 'N/A'}</p>
        </div>
      </Modal>
    </Container>
  );
}

export default ManagePackages;