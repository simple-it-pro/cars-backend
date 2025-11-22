import { useState } from 'react';
import { Form, Input, Button, Card, Typography, App, Steps } from 'antd';
import { PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

export default function LoginPage() {
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { requestCode, login } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const handleRequestCode = async (values: { phone: string }) => {
    setLoading(true);
    try {
      const testCode = await requestCode(values.phone);
      setPhone(values.phone);
      setStep(1);
      if (testCode) {
        console.log(
          '%c[TEST MODE] Код подтверждения: %c' + testCode,
          'color: #1890ff; font-weight: bold;',
          'color: #52c41a; font-size: 18px; font-weight: bold;'
        );
        message.info(`Тестовый режим: код ${testCode}`);
      } else {
        message.success('Код отправлен на указанный номер');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Ошибка отправки кода');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (values: { code: string }) => {
    setLoading(true);
    try {
      await login(phone, values.code);
      message.success('Успешный вход');
      navigate('/');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      message.error(
        err.response?.data?.message || err.message || 'Ошибка авторизации'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5',
      }}
    >
      <Card style={{ width: 400, padding: 24 }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          Админ панель
        </Title>

        <Steps
          current={step}
          items={[{ title: 'Телефон' }, { title: 'Код' }]}
          style={{ marginBottom: 32 }}
        />

        {step === 0 ? (
          <Form onFinish={handleRequestCode} layout="vertical">
            <Form.Item
              name="phone"
              label="Номер телефона"
              rules={[
                { required: true, message: 'Введите номер телефона' },
                {
                  pattern: /^\+7\d{10}$/,
                  message: 'Формат: +7XXXXXXXXXX',
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="+79991234567"
                size="large"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                Получить код
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Form onFinish={handleVerifyCode} layout="vertical">
            <Form.Item
              name="code"
              label="Код из SMS"
              rules={[
                { required: true, message: 'Введите код' },
                { len: 4, message: 'Код должен содержать 4 цифры' },
              ]}
            >
              <Input
                prefix={<LockOutlined />}
                placeholder="1234"
                size="large"
                maxLength={4}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                Войти
              </Button>
            </Form.Item>
            <Button type="link" onClick={() => setStep(0)} block>
              Изменить номер
            </Button>
          </Form>
        )}
      </Card>
    </div>
  );
}
