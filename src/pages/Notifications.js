// src/pages/Notifications.js
import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { List, Button, Typography } from 'antd';
import moment from 'moment';

const { Text } = Typography;

function NotificationsPage() {
  const { notifications, markAsRead } = useNotification();

  return (
    <div style={{ padding: '24px' }}>
      <h2>Notifications</h2>
      <List
        dataSource={notifications}
        renderItem={(notification) => (
          <List.Item
            actions={[
              !notification.is_read && (
                <Button
                  type="link"
                  onClick={() => markAsRead(notification.id)}
                >
                  Mark as Read
                </Button>
              ),
            ]}
          >
            <List.Item.Meta
              title={notification.event_type.replace('_', ' ').toLowerCase()}
              description={
                <>
                  <Text>
                    {notification.event_type === 'NEW_MESSAGE'
                      ? `New message from ${notification.message.split(':')[0].replace('New message from ', '')}`
                      : notification.message}
                  </Text>
                  <br />
                  <Text type="secondary">{moment(notification.created_at).fromNow()}</Text>
                </>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
}

export default NotificationsPage;