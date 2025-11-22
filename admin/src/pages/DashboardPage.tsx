import { Card, Row, Col, Statistic, Typography } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api';

const { Title } = Typography;

export default function DashboardPage() {
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll().then((res) => res.data),
  });

  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter((u) => !u.isDeactivated).length || 0;
  const adminUsers = users?.filter((u) => u.role === 'ADMIN').length || 0;

  return (
    <div>
      <Title level={2}>Панель управления</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Всего пользователей"
              value={totalUsers}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Активных"
              value={activeUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Администраторов"
              value={adminUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
