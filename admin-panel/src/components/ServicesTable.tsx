import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Select, Tag } from 'antd';
import { getServices, addService, updateService, deleteService, getUsers, assignUserToService, removeUserFromService, getUsersByService } from '../services/api';
import type { Service, User } from '../services/api';

const ServicesTable: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getServices();
      setServices(data);
    } catch (err) {
      message.error('Servisler yüklenemedi!');
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      message.error('Kullanıcılar yüklenemedi!');
    }
  };

  useEffect(() => {
    fetchServices();
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setEditingService(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    form.setFieldsValue({
      route: service.route || '',
      plate: service.plate || '',
      driver: service.driver || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteService(id);
      message.success('Servis silindi');
      fetchServices();
    } catch {
      message.error('Servis silinemedi!');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form values:', values);
      setSaving(true);
      if (editingService) {
        await updateService(editingService.id, values);
        message.success('Servis güncellendi');
      } else {
        await addService(values);
        message.success('Servis eklendi');
      }
      setModalOpen(false);
      fetchServices();
    } catch (err) {
      // validation error or API error
    } finally {
      setSaving(false);
    }
  };

  const openAssignModal = async (service: Service) => {
    setSelectedService(service);
    const users = await getUsersByService(service.id);
    setAssignedUsers(users);
    setAssignModalOpen(true);
  };

  const handleAssignUser = async (userId: string) => {
    if (!selectedService) return;
    try {
      await assignUserToService(userId, selectedService.id);
      const [updatedAssignedUsers, updatedUsers] = await Promise.all([
        getUsersByService(selectedService.id),
        getUsers()
      ]);
      setAssignedUsers(updatedAssignedUsers);
      setUsers(updatedUsers);
      message.success('Kullanıcı servise atandı');
    } catch {
      message.error('Kullanıcı atanamadı!');
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!selectedService) return;
    try {
      await removeUserFromService(userId, selectedService.id);
      const [updatedAssignedUsers, updatedUsers] = await Promise.all([
        getUsersByService(selectedService.id),
        getUsers()
      ]);
      setAssignedUsers(updatedAssignedUsers);
      setUsers(updatedUsers);
      message.success('Kullanıcı servisten kaldırıldı');
    } catch {
      message.error('Kullanıcı kaldırılamadı!');
    }
  };

  const columns = [
    { title: 'Güzergah', dataIndex: 'route', key: 'route' },
    { title: 'Plaka', dataIndex: 'plate', key: 'plate' },
    { title: 'Şoför', dataIndex: 'driver', key: 'driver' },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: Service) => (
        <Space>
          <Button type="link" onClick={() => openEditModal(record)}>Düzenle</Button>
          <Button type="link" onClick={() => openAssignModal(record)}>Personel Ata</Button>
          <Popconfirm title="Bu servisi silmek istediğinize emin misiniz?" onConfirm={() => handleDelete(record.id)} okText="Evet" cancelText="Hayır">
            <Button type="link" danger>Sil</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={openAddModal} style={{ marginBottom: 16 }}>Servis Oluştur</Button>
      <Table dataSource={services} columns={columns} rowKey="id" bordered pagination={false} loading={loading} />
      
      {/* Servis Ekleme/Düzenleme Modal */}
      <Modal
        title={editingService ? 'Servis Düzenle' : 'Yeni Servis Oluştur'}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        okText="Kaydet"
        cancelText="Vazgeç"
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="route" label="Güzergah">
            <Input />
          </Form.Item>
          <Form.Item name="plate" label="Plaka" rules={[{ required: true, message: 'Plaka girin!' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="driver" label="Şoför" rules={[{ required: true, message: 'Şoför seçin!' }]}> 
            <Select placeholder="Şoför seçin">
              {users.filter(u => u.role === 'Şoför').map(u => (
                <Select.Option key={u.id} value={u.id}>{u.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Kullanıcı Atama Modal */}
      <Modal
        title="Servis Personeli Yönetimi"
        open={assignModalOpen}
        onCancel={() => setAssignModalOpen(false)}
        footer={null}
      >
        <div style={{ marginBottom: 16 }}>
          <Select
            style={{ width: '100%' }}
            placeholder="Personel seçin"
            onChange={handleAssignUser}
          >
            {users
              .filter(user => !assignedUsers.find(au => au.id === user.id))
              .map(user => (
                <Select.Option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </Select.Option>
              ))}
          </Select>
        </div>
        <div>
          <h4>Atanmış Personel:</h4>
          {assignedUsers.map(user => (
            <Tag
              key={user.id}
              closable
              onClose={() => handleRemoveUser(user.id)}
              style={{ marginBottom: 8 }}
            >
              {user.name} ({user.role})
            </Tag>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default ServicesTable; 