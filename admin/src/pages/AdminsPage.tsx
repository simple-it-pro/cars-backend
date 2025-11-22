import { useQuery } from '@tanstack/react-query';
import {
  Table,
  Tag,
  Avatar,
  Typography,
  Card,
  Input,
  Space,
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { usersApi } from '../api';
import type { User } from '../api';

const { Title } = Typography;

export default function AdminsPage() {
  const [searchText, setSearchText] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['advanced-users'],
    queryFn: () => usersApi.adminGetAdvanced().then((res) => res.data),
  });

  const filteredUsers = users?.filter(
    (user) =>
      user.phone?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.nickname?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase())
  );

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
      render: () => <Tag color="purple">Продвинутый</Tag>,
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
  ];

  return (
    <div>
      <Title level={2}>Администраторы</Title>
      <Typography.Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
        Пользователи с расширенным доступом к админ-панели
      </Typography.Text>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Поиск по имени, телефону, email..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
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
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
}
