import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Tag,
  Avatar,
  Typography,
  Card,
  Input,
  Space,
  Button,
  Modal,
  Form,
  Select,
  message,
  Popconfirm,
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { usersApi } from '../api';
import type { User } from '../api';
import type { CreateUserData, UpdateUserData } from '../api/users';

const { Title } = Typography;

type UserFormData = CreateUserData & { isDeactivated?: boolean };

export default function UsersPage() {
  const [searchText, setSearchText] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm<UserFormData>();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', nameFilter],
    queryFn: () =>
      usersApi
        .adminGetAll(nameFilter ? { name: nameFilter } : undefined)
        .then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserData) => usersApi.adminCreate(data),
    onSuccess: () => {
      message.success('Пользователь создан');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCloseModal();
    },
    onError: (error: Error) => {
      message.error(error.message || 'Ошибка при создании пользователя');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      usersApi.adminUpdate(id, data),
    onSuccess: () => {
      message.success('Пользователь обновлен');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCloseModal();
    },
    onError: (error: Error) => {
      message.error(error.message || 'Ошибка при обновлении пользователя');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.adminDelete(id),
    onSuccess: () => {
      message.success('Пользователь удален');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      message.error(error.message || 'Ошибка при удалении пользователя');
    },
  });

  const filteredUsers = users?.filter((user) => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      user.phone?.toLowerCase().includes(search) ||
      user.nickname?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search)
    );
  });

  const handleOpenCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      phone: user.phone,
      name: user.name || undefined,
      nickname: user.nickname || undefined,
      email: user.email || undefined,
      city: user.city || undefined,
      role: user.role as 'COMMON' | 'ADVANCED' | 'ADMIN',
      isDeactivated: user.isDeactivated,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleSubmit = async (values: UserFormData) => {
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Аватар',
      dataIndex: 'image',
      key: 'avatar',
      width: 70,
      render: (image) => (
        <Avatar src={image?.url} icon={<UserOutlined />} size={40} />
      ),
    },
    {
      title: 'Имя',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <span>{name || '-'}</span>
          {record.nickname && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              @{record.nickname}
            </Typography.Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Телефон',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => email || '-',
    },
    {
      title: 'Город',
      dataIndex: 'city',
      key: 'city',
      render: (city) => city || '-',
    },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Админ', value: 'ADMIN' },
        { text: 'Продвинутый', value: 'ADVANCED' },
        { text: 'Обычный', value: 'COMMON' },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role) => {
        const colors: Record<string, string> = {
          ADMIN: 'red',
          ADVANCED: 'purple',
          COMMON: 'blue',
        };
        const labels: Record<string, string> = {
          ADMIN: 'Админ',
          ADVANCED: 'Продвинутый',
          COMMON: 'Обычный',
        };
        return <Tag color={colors[role]}>{labels[role] || role}</Tag>;
      },
    },
    {
      title: 'Рейтинг',
      dataIndex: 'rating',
      key: 'rating',
      sorter: (a, b) => (a.rating || 0) - (b.rating || 0),
      render: (rating) => (rating ? rating.toFixed(1) : '-'),
    },
    {
      title: 'Статус',
      dataIndex: 'isDeactivated',
      key: 'status',
      filters: [
        { text: 'Активен', value: false },
        { text: 'Деактивирован', value: true },
      ],
      onFilter: (value, record) => record.isDeactivated === value,
      render: (isDeactivated) => (
        <Tag color={isDeactivated ? 'orange' : 'green'}>
          {isDeactivated ? 'Деактивирован' : 'Активен'}
        </Tag>
      ),
    },
    {
      title: 'Регистрация',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleOpenEdit(record)}
          />
          <Popconfirm
            title="Удалить пользователя?"
            description="Это действие нельзя отменить"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Пользователи</Title>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Input
              placeholder="Фильтр по имени"
              prefix={<SearchOutlined />}
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Input
              placeholder="Поиск по телефону, email..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
            Добавить пользователя
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Всего: ${total}`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingUser ? 'Редактировать пользователя' : 'Создать пользователя'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ role: 'COMMON' }}
        >
          <Form.Item
            name="phone"
            label="Телефон"
            rules={[
              { required: true, message: 'Введите телефон' },
              {
                pattern: /^\+7\d{10}$/,
                message: 'Формат: +7XXXXXXXXXX',
              },
            ]}
          >
            <Input placeholder="+79991234567" />
          </Form.Item>

          <Form.Item name="name" label="Имя">
            <Input placeholder="Иван Иванов" />
          </Form.Item>

          <Form.Item name="nickname" label="Никнейм">
            <Input placeholder="ivan" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Некорректный email' }]}
          >
            <Input placeholder="user@example.com" />
          </Form.Item>

          <Form.Item name="city" label="Город">
            <Input placeholder="Москва" />
          </Form.Item>

          <Form.Item name="role" label="Роль">
            <Select>
              <Select.Option value="COMMON">Обычный</Select.Option>
              <Select.Option value="ADVANCED">Продвинутый</Select.Option>
              <Select.Option value="ADMIN">Админ</Select.Option>
            </Select>
          </Form.Item>

          {editingUser && (
            <Form.Item name="isDeactivated" label="Статус">
              <Select>
                <Select.Option value={false}>Активен</Select.Option>
                <Select.Option value={true}>Деактивирован</Select.Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCloseModal}>Отмена</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingUser ? 'Сохранить' : 'Создать'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
