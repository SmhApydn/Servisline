import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Spin } from 'antd';
import type { ServiceRoute } from '../services/api';
import { getServiceRoutes, addServiceRoute, updateServiceRoute, deleteServiceRoute } from '../services/api';

const ServiceRoutesTable: React.FC = () => {
  const [routes, setRoutes] = useState<ServiceRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<ServiceRoute | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const data = await getServiceRoutes();
      setRoutes(data);
    } catch (err) {
      message.error('Rotalar yüklenemedi!');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const openAddModal = () => {
    setEditingRoute(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (route: ServiceRoute) => {
    setEditingRoute(route);
    form.setFieldsValue(route);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteServiceRoute(id);
      message.success('Rota silindi');
      fetchRoutes();
    } catch {
      message.error('Rota silinemedi!');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingRoute) {
        await updateServiceRoute(editingRoute.id, values);
        message.success('Rota güncellendi');
      } else {
        await addServiceRoute(values);
        message.success('Rota eklendi');
      }
      setModalOpen(false);
      fetchRoutes();
    } catch (err) {
      // validation error or API error
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: 'Rota Adı', dataIndex: 'name', key: 'name' },
    { title: 'Başlangıç', dataIndex: 'start', key: 'start' },
    { title: 'Bitiş', dataIndex: 'end', key: 'end' },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: ServiceRoute) => (
        <Space>
          <Button type="link" onClick={() => openEditModal(record)}>Düzenle</Button>
          <Popconfirm title="Silmek istediğinize emin misiniz?" onConfirm={() => handleDelete(record.id)} okText="Evet" cancelText="Hayır">
            <Button type="link" danger>Sil</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={openAddModal} style={{ marginBottom: 16 }}>Yeni Rota Ekle</Button>
      <Spin spinning={loading} tip="Yükleniyor...">
        <Table dataSource={routes} columns={columns} rowKey="id" bordered pagination={false} />
      </Spin>
      <Modal
        title={editingRoute ? 'Rota Düzenle' : 'Yeni Rota Ekle'}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        okText="Kaydet"
        cancelText="İptal"
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Rota Adı" rules={[{ required: true, message: 'Rota adı girin!' }]}> <Input /> </Form.Item>
          <Form.Item name="start" label="Başlangıç Noktası" rules={[{ required: true, message: 'Başlangıç girin!' }]}> <Input /> </Form.Item>
          <Form.Item name="end" label="Bitiş Noktası" rules={[{ required: true, message: 'Bitiş girin!' }]}> <Input /> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ServiceRoutesTable; 