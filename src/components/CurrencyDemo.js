import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Space, Button } from 'antd';
import { formatPrice, getCurrencySymbol, getUserCurrency, setUserCurrency, getCurrencyOptions } from '../utils/currency';
import CurrencySelector from './CurrencySelector';

const { Title, Text } = Typography;

const CurrencyDemo = () => {
  const [currentCurrency, setCurrentCurrency] = useState('EUR');
  const [demoAmounts] = useState([50, 100, 250, 500, 1000, 2500]);

  useEffect(() => {
    setCurrentCurrency(getUserCurrency());
  }, []);

  const handleCurrencyChange = (newCurrency) => {
    setUserCurrency(newCurrency);
    setCurrentCurrency(newCurrency);
    // Force re-render by updating state
    setCurrentCurrency(getUserCurrency());
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Multi-Currency Support Demo</Title>
      
      <Card style={{ marginBottom: '20px' }}>
        <Title level={4}>Currency Selector</Title>
        <CurrencySelector 
          onChange={handleCurrencyChange}
          showLabel={true}
        />
        <Text type="secondary" style={{ display: 'block', marginTop: '10px' }}>
          Current currency: {getCurrencySymbol()} ({getUserCurrency()})
        </Text>
      </Card>

      <Card>
        <Title level={4}>Price Display Examples</Title>
        <Row gutter={[16, 16]}>
          {demoAmounts.map((amount) => (
            <Col xs={12} sm={8} md={6} key={amount}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Text strong>{formatPrice(amount)}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {amount} in {getUserCurrency()}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card style={{ marginTop: '20px' }}>
        <Title level={4}>Available Currencies</Title>
        <Space wrap>
          {getCurrencyOptions().map((option) => (
            <Button 
              key={option.value}
              type={currentCurrency === option.value ? 'primary' : 'default'}
              onClick={() => handleCurrencyChange(option.value)}
              size="small"
            >
              {option.symbol} {option.name}
            </Button>
          ))}
        </Space>
      </Card>
    </div>
  );
};

export default CurrencyDemo;
