import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Tag,
  Avatar,
  Typography,
  Card,
  Space,
  Button,
  Modal,
  Form,
  Input,
  message,
  Divider,
  Empty,
  Badge,
} from 'antd';
import {
  UserOutlined,
  CheckOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { postsApi } from '../api';
import type { Post } from '../api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function PostsPage() {
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingPost, setRejectingPost] = useState<Post | null>(null);
  const [form] = Form.useForm<{ reason: string }>();
  const queryClient = useQueryClient();

  const { data: pendingPosts, isLoading: pendingLoading } = useQuery({
    queryKey: ['posts', 'pending'],
    queryFn: () => postsApi.adminGetPending().then((res) => res.data),
  });

  const { data: publishedPosts, isLoading: publishedLoading } = useQuery({
    queryKey: ['posts', 'published'],
    queryFn: () => postsApi.adminGetPublished().then((res) => res.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => postsApi.adminApprove(id),
    onSuccess: () => {
      message.success('Пост одобрен');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: Error) => {
      message.error(error.message || 'Ошибка при одобрении поста');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      postsApi.adminReject(id, { reason }),
    onSuccess: () => {
      message.success('Пост отклонен');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      handleCloseRejectModal();
    },
    onError: (error: Error) => {
      message.error(error.message || 'Ошибка при отклонении поста');
    },
  });

  const handleOpenRejectModal = (post: Post) => {
    setRejectingPost(post);
    form.resetFields();
    setRejectModalOpen(true);
  };

  const handleCloseRejectModal = () => {
    setRejectModalOpen(false);
    setRejectingPost(null);
    form.resetFields();
  };

  const handleReject = async (values: { reason: string }) => {
    if (rejectingPost) {
      rejectMutation.mutate({ id: rejectingPost.id, reason: values.reason });
    }
  };

  const handleApprove = (post: Post) => {
    Modal.confirm({
      title: 'Одобрить пост?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <Paragraph ellipsis={{ rows: 3 }}>{post.content}</Paragraph>
          <Text type="secondary">Автор: {post.user?.name || post.user?.phone}</Text>
        </div>
      ),
      okText: 'Одобрить',
      cancelText: 'Отмена',
      onOk: () => approveMutation.mutate(post.id),
    });
  };

  const pendingColumns: ColumnsType<Post> = [
    {
      title: 'Автор',
      key: 'author',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar src={record.user?.image?.url} icon={<UserOutlined />} />
          <Space direction="vertical" size={0}>
            <Text strong>{record.user?.name || '-'}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.user?.phone}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Текст поста',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content) => (
        <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'ещё' }}>
          {content}
        </Paragraph>
      ),
    },
    {
      title: 'Дата создания',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) =>
        new Date(date).toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleApprove(record)}
            loading={approveMutation.isPending}
          >
            Одобрить
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={() => handleOpenRejectModal(record)}
          >
            Отклонить
          </Button>
        </Space>
      ),
    },
  ];

  const publishedColumns: ColumnsType<Post> = [
    {
      title: 'Автор',
      key: 'author',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar src={record.user?.image?.url} icon={<UserOutlined />} />
          <Space direction="vertical" size={0}>
            <Text strong>{record.user?.name || '-'}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.user?.phone}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Текст поста',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content) => (
        <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'ещё' }}>
          {content}
        </Paragraph>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const config: Record<string, { color: string; label: string }> = {
          PENDING: { color: 'orange', label: 'На модерации' },
          PUBLISHED: { color: 'green', label: 'Опубликован' },
          REJECTED: { color: 'red', label: 'Отклонен' },
        };
        const { color, label } = config[status] || { color: 'default', label: status };
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Дата создания',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date) =>
        new Date(date).toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
  ];

  const pendingCount = pendingPosts?.length || 0;

  return (
    <div>
      <Title level={2}>Посты</Title>

      {/* Блок модерации */}
      <Card
        title={
          <Space>
            <span>На модерацию</span>
            {pendingCount > 0 && <Badge count={pendingCount} />}
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        {pendingPosts?.length === 0 ? (
          <Empty description="Нет постов на модерацию" />
        ) : (
          <Table
            columns={pendingColumns}
            dataSource={pendingPosts}
            loading={pendingLoading}
            rowKey="id"
            pagination={false}
            scroll={{ x: 800 }}
          />
        )}
      </Card>

      <Divider />

      {/* Блок опубликованных постов */}
      <Card title="Опубликованные посты">
        <Table
          columns={publishedColumns}
          dataSource={publishedPosts}
          loading={publishedLoading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Всего: ${total}`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Модалка отклонения */}
      <Modal
        title="Отклонить пост"
        open={rejectModalOpen}
        onCancel={handleCloseRejectModal}
        footer={null}
        destroyOnClose
      >
        {rejectingPost && (
          <>
            <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
              <Space direction="vertical" size={4}>
                <Space>
                  <Avatar
                    src={rejectingPost.user?.image?.url}
                    icon={<UserOutlined />}
                    size="small"
                  />
                  <Text strong>
                    {rejectingPost.user?.name || rejectingPost.user?.phone}
                  </Text>
                </Space>
                <Paragraph
                  ellipsis={{ rows: 3 }}
                  style={{ marginBottom: 0 }}
                >
                  {rejectingPost.content}
                </Paragraph>
              </Space>
            </Card>

            <Form form={form} layout="vertical" onFinish={handleReject}>
              <Form.Item
                name="reason"
                label="Причина отклонения"
                rules={[
                  { required: true, message: 'Укажите причину отклонения' },
                  { max: 500, message: 'Максимум 500 символов' },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Опишите причину отклонения поста. Эта информация будет отправлена автору в уведомлении."
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  <Button onClick={handleCloseRejectModal}>Отмена</Button>
                  <Button
                    type="primary"
                    danger
                    htmlType="submit"
                    loading={rejectMutation.isPending}
                  >
                    Отклонить
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
}
