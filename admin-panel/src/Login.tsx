import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = (values: { username: string; password: string }) => {
    setLoading(true);
    // Sahte doğrulama: kullanıcı adı admin, şifre 1234
    setTimeout(() => {
      setLoading(false);
      if (values.username === 'admin' && values.password === '1234') {
        onLogin();
      } else {
        message.error('Kullanıcı adı veya şifre hatalı!');
      }
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      minWidth: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f2f5',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 1000
    }}>
      <Card title="Yönetici Girişi" style={{ width: 400, maxWidth: '90vw', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
        <Form name="login" onFinish={onFinish} layout="vertical">
          <Form.Item name="username" label="Kullanıcı Adı" rules={[{ required: true, message: 'Kullanıcı adı girin!' }]}> 
            <Input autoFocus />
          </Form.Item>
          <Form.Item name="password" label="Şifre" rules={[{ required: true, message: 'Şifre girin!' }]}> 
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} style={{ height: 48, fontSize: 18 }}>
              Giriş Yap
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login; 