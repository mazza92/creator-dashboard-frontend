import React from 'react';
import { Typography, Form, Input, Button, Row, Col, Card } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import LandingPageLayout from '../Layouts/LandingPageLayout';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const PageContainer = styled.div`
  padding-top: 80px;
  min-height: 100vh;
  background: #f8f9fa;
`;

const Section = styled.section`
  padding: 80px 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ContactCard = styled(Card)`
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const ContactPage = () => {
  const onFinish = (values) => {
    const { name, email, subject, message } = values;
    const emailBody = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    window.location.href = `mailto:team@newcollab.co?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
  };

  return (
    <LandingPageLayout>
      <PageContainer>
        <Section>
          <Title level={1} style={{ textAlign: 'center', marginBottom: '24px' }}>
            Get in Touch
          </Title>
          <Paragraph style={{ textAlign: 'center', fontSize: '18px', maxWidth: '600px', margin: '0 auto 48px' }}>
            Have questions about Newcollab? We're here to help. Send us a message and we'll respond as soon as possible.
          </Paragraph>

          <Row justify="center">
            <Col xs={24} md={12}>
              <ContactCard>
                <Form
                  layout="vertical"
                  onFinish={onFinish}
                  requiredMark={false}
                >
                  <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                  >
                    <Input size="large" placeholder="Your name" />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input size="large" placeholder="Your email" />
                  </Form.Item>

                  <Form.Item
                    name="subject"
                    label="Subject"
                    rules={[{ required: true, message: 'Please enter a subject' }]}
                  >
                    <Input size="large" placeholder="What's this about?" />
                  </Form.Item>

                  <Form.Item
                    name="message"
                    label="Message"
                    rules={[{ required: true, message: 'Please enter your message' }]}
                  >
                    <TextArea
                      size="large"
                      rows={6}
                      placeholder="Your message"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      icon={<SendOutlined />}
                      style={{ width: '100%', height: '48px' }}
                    >
                      Send Message
                    </Button>
                  </Form.Item>
                </Form>
              </ContactCard>
            </Col>
          </Row>
        </Section>
      </PageContainer>
    </LandingPageLayout>
  );
};

export default ContactPage; 