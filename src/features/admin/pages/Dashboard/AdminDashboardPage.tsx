import React, { useState, useEffect, useCallback } from 'react';
import { Spin, Row, Col, Alert } from 'antd';
import { useAnalytics } from '@/hooks/useAnalytics';
import dayjs from 'dayjs';
import OverviewSection from './components/OverviewSection';
import RevenueChart from './components/RevenueChart';
import { OrderStatusCard, TopShopsCard } from './components/SideStats';
import RecentOrders from './components/RecentOrders';
import DateFilterHeader from './components/DateFilterHeader';

const AdminDashboardPage: React.FC = () => {
    const {
        fetchAdminDashboard,
        isLoading,
        error,
        adminDashboard
    } = useAnalytics();

    const [params, setParams] = useState({
        startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD')
    });

    useEffect(() => {
        fetchAdminDashboard(params);
    }, [fetchAdminDashboard, params]);

    const handleFilterChange = useCallback((startDate: string, endDate: string) => {
        setParams({ startDate, endDate });
    }, []);

    if (isLoading && !adminDashboard) {
        return (
            <div className="flex h-[80vh] w-full items-center justify-center">
                <Spin size="large" tip="Đang tải dữ liệu tổng quan..." />
            </div>
        );
    }

    if (error && !adminDashboard) {
        return <Alert type="error" message="Lỗi tải dữ liệu" description={error} showIcon className="m-4" />;
    }

    const overviewData = {
        totalSystemRevenue: adminDashboard?.summaryCards.find(c => c.metricType === 'CURRENCY')?.numericValue || 0,
        totalOrders: adminDashboard?.summaryCards.find(c => c.icon === 'shopping-cart')?.numericValue || 0,
        totalUsers: adminDashboard?.summaryCards.find(c => c.icon === 'users')?.numericValue || 0, // Using New Customers proxy or fetch separate
        totalActiveShops: adminDashboard?.secondaryKPIs.activeShops || 0
    };

    const overviewCards = [
        {
            title: 'Tổng doanh thu',
            description: 'Tổng doanh thu hệ thống',
            icon: 'dollar',
            value: overviewData.totalSystemRevenue || 0,
            trend: 'NEUTRAL',
            changePercent: adminDashboard?.summaryCards.find(c => c.metricType === 'CURRENCY')?.changePercent || 0,
        },
        {
            title: 'Tổng đơn hàng',
            description: 'Số đơn phát sinh',
            icon: 'shopping-cart',
            value: overviewData.totalOrders || 0,
            trend: 'NEUTRAL',
            changePercent: 0,
        },
        {
            title: 'Người dùng',
            description: 'Người dùng mới',
            icon: 'users',
            value: overviewData.totalUsers || 0,
            trend: 'NEUTRAL',
            changePercent: 0,
        },
        {
            title: 'Cửa hàng hoạt động',
            description: 'Số cửa hàng đang hoạt động',
            icon: 'store',
            value: overviewData.totalActiveShops || 0,
            trend: 'NEUTRAL',
            changePercent: 0,
        },
    ];

    return (
        <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
            <DateFilterHeader
                title="Tổng quan hệ thống"
                subtitle="Dữ liệu thống kê toàn sàn"
                isLoading={isLoading}
                onFilterChange={handleFilterChange}
                onRefresh={() => fetchAdminDashboard(params)}
            />
            <OverviewSection data={overviewCards as any} />
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <RevenueChart data={adminDashboard?.charts.revenueChart} />
                </Col>
                <Col xs={24} lg={8}>
                    <OrderStatusCard data={adminDashboard?.charts.orderStatusDistribution} />
                </Col>
            </Row>
            <Row gutter={[16, 16]}>
                <Col xs={24} xl={16}>
                    <RecentOrders data={adminDashboard?.recentActivities.recentOrders} />
                </Col>
                <Col xs={24} xl={8}>
                    <TopShopsCard data={adminDashboard?.topPerformers.topShops} />
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboardPage;