// src/PaymentFailed.js
import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const PaymentFailed = () => {
    const navigate = useNavigate();

    return (
        <Result
            status="error"
            title="Payment Failed"
            subTitle="Something went wrong with your payment. Please try again."
            extra={[
                <Button type="primary" key="retry" onClick={() => navigate('/brand/dashboard/marketplace')}>
                    Retry Payment
                </Button>,
            ]}
        />
    );
};

export default PaymentFailed;