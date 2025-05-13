import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message } from 'antd';
import { getUsers, addUser, updateUser, deleteUser } from '../services/api';
import type { User } from '../services/api';

const DriversTable: React.FC = () => {
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setDrivers(data.filter(u => u.role === 'Şoför'));
    } catch (err) {
      message.error('Şoförler yüklenemedi!');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const openAddModal = () => {
    setEditingDriver(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (driver: User) => {
    setEditingDriver(driver);
    form.setFieldsValue(driver);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      message.success('Şoför silindi');
      fetchDrivers();
    } catch {
      message.error('Şoför silinemedi!');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingDriver) {
        await updateUser(editingDriver.id, { ...values, role: 'Şoför' });
        message.success('Şoför güncellendi');
      } else {
        await addUser({ ...values, role: 'Şoför', password: 'VarsayilanSifre123' });
        message.success('Şoför eklendi');
      }
      setModalOpen(false);
      fetchDrivers();
    } catch (err) {
      // validation error or API error
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: 'Ad Soyad', dataIndex: 'name', key: 'name' },
    { title: 'E-posta', dataIndex: 'email', key: 'email' },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button type="link" onClick={() => openEditModal(record)}>Düzenle</Button>
          <Popconfirm title="Bu şoförü silmek istediğinize emin misiniz?" onConfirm={() => handleDelete(record.id)} okText="Evet" cancelText="Hayır">
            <Button type="link" danger>Sil</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={openAddModal} style={{ marginBottom: 16 }}>Şoför Ekle</Button>
      <Table dataSource={drivers} columns={columns} rowKey="id" bordered pagination={false} loading={loading} />
      <Modal
        title={editingDriver ? 'Şoför Düzenle' : 'Yeni Şoför Ekle'}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        okText="Kaydet"
        cancelText="Vazgeç"
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="name" 
            label="Ad Soyad" 
            rules={[{ required: true, message: 'Ad soyad girin!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            name="email" 
            label="E-posta" 
            rules={[
              { required: true, message: 'E-posta girin!' },
              { type: 'email', message: 'Geçerli bir e-posta adresi girin!' }
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DriversTable; 