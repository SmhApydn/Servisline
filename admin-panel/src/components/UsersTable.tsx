import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Select } from 'antd';
import { getUsers, addUser, updateUser, deleteUser } from '../services/api';
import type { User } from '../services/api';

const { Option } = Select;

const UsersTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      message.error('Kullanıcılar yüklenemedi!');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      message.success('Kullanıcı silindi');
      fetchUsers();
    } catch {
      message.error('Kullanıcı silinemedi!');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingUser) {
        await updateUser(editingUser.id, values);
        message.success('Kullanıcı güncellendi');
      } else {
        await addUser(values);
        message.success('Kullanıcı eklendi');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      // validation error or API error
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: 'Ad Soyad', dataIndex: 'name', key: 'name' },
    { title: 'E-posta', dataIndex: 'email', key: 'email' },
    { title: 'Rol', dataIndex: 'role', key: 'role' },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button type="link" onClick={() => openEditModal(record)}>Düzenle</Button>
          <Popconfirm title="Bu kullanıcıyı silmek istediğinize emin misiniz?" onConfirm={() => handleDelete(record.id)} okText="Evet" cancelText="Hayır">
            <Button type="link" danger>Sil</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={openAddModal} style={{ marginBottom: 16 }}>Personel Ekle</Button>
      <Table dataSource={users} columns={columns} rowKey="id" bordered pagination={false} loading={loading} />
      
      <Modal
        title={editingUser ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
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
          <Form.Item 
            name="role" 
            label="Rol" 
            rules={[{ required: true, message: 'Rol seçin!' }]}
          >
            <Select>
              <Option value="Şoför">Şoför</Option>
              <Option value="Çalışan">Çalışan</Option>
              <Option value="Yönetici">Yönetici</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersTable; 