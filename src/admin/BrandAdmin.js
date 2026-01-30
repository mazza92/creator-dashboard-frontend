import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);
import {
  Button, Input, message, Modal, Space, Tag, Form, Select,
  Upload, Tabs, Card, Statistic, Row, Col, Tooltip, Popconfirm,
  Drawer, Switch, InputNumber
} from 'antd';
import {
  PlusOutlined, SaveOutlined, DeleteOutlined, UploadOutlined,
  ReloadOutlined, ExportOutlined, ImportOutlined, CopyOutlined,
  CheckCircleOutlined, CloseCircleOutlined, EyeOutlined,
  LockOutlined, UserOutlined, SearchOutlined, FilterOutlined
} from '@ant-design/icons';
import api from '../config/api';

// Admin credentials - same as PRHunter
const ADMIN_EMAIL = 'team@newcollab.co';
const ADMIN_PASSWORD = 'Ilovela1992!';

// Category options
const CATEGORY_OPTIONS = [
  'skincare', 'beauty', 'fashion', 'wellness', 'fitness',
  'food', 'travel', 'tech', 'gaming', 'lifestyle',
  'home', 'pet', 'baby', 'jewelry', 'haircare',
  'sustainable', 'luxury', 'activewear', 'supplements', 'other'
];

// Platform options
const PLATFORM_OPTIONS = ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook', 'Pinterest'];

// Region options
const REGION_OPTIONS = ['USA', 'UK', 'Canada', 'Australia', 'Europe', 'Worldwide', 'Asia'];

const BrandAdmin = () => {
  const gridRef = useRef();
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 });
  const [selectedRows, setSelectedRows] = useState([]);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [unsavedChanges, setUnsavedChanges] = useState(new Set());
  const [form] = Form.useForm();

  // Check auth on mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem('brandAdminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchBrands();
    }
  }, [isAuthenticated]);

  const getApiConfig = () => ({
    headers: { 'X-Admin-Token': 'pr-hunter-admin-2026' }
  });

  const fetchBrands = async () => {
    setLoading(true);
    try {
      // Fetch all brands - no limit for admin CRM
      const { data } = await api.get('/api/admin/brands?limit=10000', getApiConfig());
      const brands = data.brands || data || [];
      setRowData(brands);

      // Calculate stats from pagination if available, otherwise from fetched data
      const total = data.pagination?.total || brands.length;
      const published = brands.filter(b => b.status === 'published' || !b.status).length;
      setStats({
        total: total,
        published,
        draft: total - published
      });
    } catch (error) {
      console.error('Failed to fetch brands:', error);
      if (error.response?.status === 404) {
        // Endpoint might not exist yet, show empty state
        message.info('No brands found. Add your first brand!');
        setRowData([]);
      } else {
        message.error('Failed to load brands');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (values) => {
    if (values.email === ADMIN_EMAIL && values.password === ADMIN_PASSWORD) {
      sessionStorage.setItem('brandAdminAuth', 'true');
      setIsAuthenticated(true);
      message.success('Welcome to Brand Admin!');
    } else {
      message.error('Invalid credentials');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('brandAdminAuth');
    setIsAuthenticated(false);
  };

  // Auto-save cell changes
  const onCellValueChanged = useCallback(async (params) => {
    const { data, colDef, newValue, oldValue } = params;

    if (newValue === oldValue) return;

    // Mark as having unsaved changes
    setUnsavedChanges(prev => new Set(prev).add(data.id));

    // Auto-save after a short delay
    try {
      await api.patch(
        `/api/admin/brands/${data.id}`,
        { [colDef.field]: newValue },
        getApiConfig()
      );

      setUnsavedChanges(prev => {
        const next = new Set(prev);
        next.delete(data.id);
        return next;
      });

      message.success(`Updated ${colDef.headerName}`, 1);
    } catch (error) {
      console.error('Failed to save:', error);
      message.error(`Failed to save ${colDef.headerName}`);
      // Revert the change
      params.node.setDataValue(colDef.field, oldValue);
    }
  }, []);

  // Add new brand
  const addNewBrand = async () => {
    const newBrand = {
      name: 'New Brand',
      slug: `new-brand-${Date.now()}`,
      status: 'draft',
      category: 'other',
      min_followers: 0,
      platforms: [],
      regions: ['Worldwide'],
      accepting_pr: true,
      created_at: new Date().toISOString()
    };

    try {
      const { data } = await api.post(
        '/api/admin/brands',
        newBrand,
        getApiConfig()
      );

      const savedBrand = data.brand || { ...newBrand, id: Date.now() };
      setRowData(prev => [savedBrand, ...prev]);
      message.success('New brand added! Click cells to edit.');

      // Focus the first cell of the new row
      setTimeout(() => {
        gridRef.current?.api?.setFocusedCell(0, 'name');
        gridRef.current?.api?.startEditingCell({ rowIndex: 0, colKey: 'name' });
      }, 100);
    } catch (error) {
      console.error('Failed to add brand:', error);
      message.error('Failed to add brand');
    }
  };

  // Delete brands
  const deleteBrands = async (ids) => {
    try {
      await Promise.all(
        ids.map(id =>
          api.delete(`/api/admin/brands/${id}`, getApiConfig())
        )
      );
      setRowData(prev => prev.filter(b => !ids.includes(b.id)));
      setSelectedRows([]);
      message.success(`Deleted ${ids.length} brand(s)`);
    } catch (error) {
      console.error('Failed to delete:', error);
      message.error('Failed to delete brands');
    }
  };

  // Bulk update status
  const bulkUpdateStatus = async (status) => {
    const ids = selectedRows.map(r => r.id);
    try {
      await api.post(
        '/api/admin/brands/bulk-update',
        { ids, updates: { status } },
        getApiConfig()
      );

      setRowData(prev => prev.map(b =>
        ids.includes(b.id) ? { ...b, status } : b
      ));

      message.success(`Updated ${ids.length} brands to ${status}`);
      setSelectedRows([]);
    } catch (error) {
      console.error('Failed to bulk update:', error);
      message.error('Failed to update brands');
    }
  };

  // Duplicate brand
  const duplicateBrand = async (brand) => {
    const newBrand = {
      ...brand,
      id: undefined,
      name: `${brand.name} (Copy)`,
      slug: `${brand.slug}-copy-${Date.now()}`,
      status: 'draft'
    };

    try {
      const { data } = await api.post(
        '/api/admin/brands',
        newBrand,
        getApiConfig()
      );

      setRowData(prev => [data.brand || newBrand, ...prev]);
      message.success('Brand duplicated');
    } catch (error) {
      message.error('Failed to duplicate');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    gridRef.current?.api?.exportDataAsCsv({
      fileName: `brands-export-${new Date().toISOString().split('T')[0]}.csv`
    });
    message.success('Exported to CSV');
  };

  // Import from clipboard (paste handler)
  const handlePaste = useCallback(async (e) => {
    const clipboardData = e.clipboardData?.getData('text');
    if (!clipboardData) return;

    // Parse TSV/CSV data
    const rows = clipboardData.split('\n').filter(r => r.trim());
    if (rows.length === 0) return;

    // Check if first row is header
    const firstRow = rows[0].toLowerCase();
    const hasHeader = firstRow.includes('name') || firstRow.includes('brand');
    const dataRows = hasHeader ? rows.slice(1) : rows;

    const newBrands = dataRows.map(row => {
      const cols = row.split('\t');
      return {
        name: cols[0]?.trim() || 'Unknown',
        slug: (cols[0]?.trim() || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        website: cols[1]?.trim() || '',
        category: cols[2]?.trim()?.toLowerCase() || 'other',
        min_followers: parseInt(cols[3]) || 0,
        application_url: cols[4]?.trim() || '',
        status: 'draft'
      };
    });

    if (newBrands.length > 0) {
      Modal.confirm({
        title: `Import ${newBrands.length} brands?`,
        content: `First brand: ${newBrands[0].name}`,
        onOk: async () => {
          try {
            const { data } = await api.post(
              '/api/admin/brands/bulk-import',
              { brands: newBrands },
              getApiConfig()
            );
            fetchBrands();
            message.success(`Imported ${data.imported || newBrands.length} brands`);
          } catch (error) {
            message.error('Import failed');
          }
        }
      });
    }
  }, []);

  // Open detail drawer for complex fields
  const openDetailDrawer = (brand) => {
    setCurrentBrand(brand);
    form.setFieldsValue({
      ...brand,
      platforms: brand.platforms || [],
      regions: brand.regions || [],
      niches: brand.niches || [],
      faqs: brand.faqs || []
    });
    setDetailDrawerVisible(true);
  };

  // Save detail form
  const saveDetailForm = async () => {
    try {
      const values = await form.validateFields();

      await api.patch(
        `/api/admin/brands/${currentBrand.id}`,
        values,
        getApiConfig()
      );

      setRowData(prev => prev.map(b =>
        b.id === currentBrand.id ? { ...b, ...values } : b
      ));

      setDetailDrawerVisible(false);
      message.success('Brand details saved');
    } catch (error) {
      console.error('Save failed:', error);
      message.error('Failed to save details');
    }
  };

  // Status cell renderer
  const StatusCellRenderer = (params) => {
    const status = params.value;
    return (
      <Tag color={status === 'published' ? 'green' : 'orange'}>
        {status === 'published' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        {' '}{status}
      </Tag>
    );
  };

  // Actions cell renderer
  const ActionsCellRenderer = (params) => {
    return (
      <Space size="small">
        <Tooltip title="Edit Details">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => openDetailDrawer(params.data)}
          />
        </Tooltip>
        <Tooltip title="Duplicate">
          <Button
            size="small"
            icon={<CopyOutlined />}
            onClick={() => duplicateBrand(params.data)}
          />
        </Tooltip>
        <Tooltip title="View Live">
          <Button
            size="small"
            icon={<ExportOutlined />}
            onClick={() => window.open(`https://newcollab.co/brand/${params.data.slug}`, '_blank')}
            disabled={params.data.status !== 'published'}
          />
        </Tooltip>
      </Space>
    );
  };

  // Column definitions - all pr_brands database fields
  const columnDefs = useMemo(() => [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      width: 50,
      pinned: 'left',
      lockPosition: true
    },
    {
      field: 'name',
      headerName: 'Brand Name',
      editable: true,
      pinned: 'left',
      width: 180,
      cellStyle: { fontWeight: 'bold' }
    },
    {
      field: 'slug',
      headerName: 'Slug',
      editable: true,
      width: 150
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ['draft', 'published'] },
      cellRenderer: StatusCellRenderer
    },
    {
      field: 'category',
      headerName: 'Category',
      editable: true,
      width: 130,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: CATEGORY_OPTIONS }
    },
    {
      field: 'website',
      headerName: 'Website',
      editable: true,
      width: 200
    },
    {
      field: 'logo',
      headerName: 'Logo URL',
      editable: true,
      width: 150
    },
    {
      field: 'cover_image_url',
      headerName: 'Cover Image',
      editable: true,
      width: 150
    },
    {
      field: 'description',
      headerName: 'Description',
      editable: true,
      width: 250,
      cellEditor: 'agLargeTextCellEditor',
      cellEditorPopup: true
    },
    // Social handles
    {
      field: 'instagram',
      headerName: 'Instagram',
      editable: true,
      width: 130
    },
    {
      field: 'tiktok',
      headerName: 'TikTok',
      editable: true,
      width: 130
    },
    {
      field: 'youtube',
      headerName: 'YouTube',
      editable: true,
      width: 130
    },
    // Requirements
    {
      field: 'min_followers',
      headerName: 'Min Followers',
      editable: true,
      width: 120,
      valueFormatter: (params) => params.value ? params.value.toLocaleString() : '0'
    },
    {
      field: 'max_followers',
      headerName: 'Max Followers',
      editable: true,
      width: 120,
      valueFormatter: (params) => params.value ? params.value.toLocaleString() : ''
    },
    {
      field: 'niches',
      headerName: 'Niches',
      editable: true,
      width: 150,
      valueFormatter: (params) => Array.isArray(params.value) ? params.value.join(', ') : params.value || ''
    },
    {
      field: 'product_types',
      headerName: 'Product Types',
      editable: true,
      width: 150
    },
    {
      field: 'platforms',
      headerName: 'Platforms',
      editable: true,
      width: 150,
      valueFormatter: (params) => Array.isArray(params.value) ? params.value.join(', ') : params.value || ''
    },
    {
      field: 'regions',
      headerName: 'Regions',
      editable: true,
      width: 150,
      valueFormatter: (params) => Array.isArray(params.value) ? params.value.join(', ') : params.value || ''
    },
    // Application info
    {
      field: 'application_url',
      headerName: 'Application URL',
      editable: true,
      width: 200
    },
    {
      field: 'contact_email',
      headerName: 'Contact Email',
      editable: true,
      width: 180
    },
    {
      field: 'has_application_form',
      headerName: 'Has App Form',
      editable: true,
      width: 110,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: [true, false] },
      cellRenderer: (params) => (
        <Tag color={params.value ? 'green' : 'default'}>
          {params.value ? 'Yes' : 'No'}
        </Tag>
      )
    },
    {
      field: 'application_method',
      headerName: 'App Method',
      editable: true,
      width: 130,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ['form', 'email', 'dm', 'website', 'other'] }
    },
    {
      field: 'application_requirements',
      headerName: 'App Requirements',
      editable: true,
      width: 200,
      cellEditor: 'agLargeTextCellEditor',
      cellEditorPopup: true
    },
    // Stats & metrics
    {
      field: 'response_rate',
      headerName: 'Response Rate',
      editable: true,
      width: 120,
      valueFormatter: (params) => params.value ? `${params.value}%` : ''
    },
    {
      field: 'avg_response_time_days',
      headerName: 'Avg Response (days)',
      editable: true,
      width: 140
    },
    {
      field: 'total_applications',
      headerName: 'Total Applications',
      editable: true,
      width: 130
    },
    {
      field: 'total_responses',
      headerName: 'Total Responses',
      editable: true,
      width: 130
    },
    // Collaboration details
    {
      field: 'avg_product_value',
      headerName: 'Avg Product Value',
      editable: true,
      width: 130,
      valueFormatter: (params) => params.value ? `$${params.value}` : ''
    },
    {
      field: 'collaboration_type',
      headerName: 'Collab Type',
      editable: true,
      width: 130,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ['gifted', 'paid', 'affiliate', 'ambassador', 'mixed'] }
    },
    {
      field: 'payment_offered',
      headerName: 'Payment Offered',
      editable: true,
      width: 120,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: [true, false] },
      cellRenderer: (params) => (
        <Tag color={params.value ? 'green' : 'default'}>
          {params.value ? 'Yes' : 'No'}
        </Tag>
      )
    },
    // Flags
    {
      field: 'accepting_pr',
      headerName: 'Accepting PR',
      editable: true,
      width: 110,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: [true, false] },
      cellRenderer: (params) => (
        <Tag color={params.value !== false ? 'green' : 'red'}>
          {params.value !== false ? 'Yes' : 'No'}
        </Tag>
      )
    },
    {
      field: 'is_featured',
      headerName: 'Featured',
      editable: true,
      width: 100,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: [true, false] },
      cellRenderer: (params) => (
        <Tag color={params.value ? 'gold' : 'default'}>
          {params.value ? 'Yes' : 'No'}
        </Tag>
      )
    },
    {
      field: 'open_pr_featured',
      headerName: 'Open PR',
      editable: true,
      width: 100,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: [true, false] },
      cellRenderer: (params) => (
        <Tag color={params.value ? 'cyan' : 'default'}>
          {params.value ? 'Yes' : 'No'}
        </Tag>
      )
    },
    {
      field: 'is_premium',
      headerName: 'Premium',
      editable: true,
      width: 100,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: [true, false] },
      cellRenderer: (params) => (
        <Tag color={params.value ? 'purple' : 'default'}>
          {params.value ? 'Yes' : 'No'}
        </Tag>
      )
    },
    // SEO
    {
      field: 'seo_title',
      headerName: 'SEO Title',
      editable: true,
      width: 200
    },
    {
      field: 'seo_description',
      headerName: 'SEO Description',
      editable: true,
      width: 200,
      cellEditor: 'agLargeTextCellEditor',
      cellEditorPopup: true
    },
    // Notes & other
    {
      field: 'notes',
      headerName: 'Notes',
      editable: true,
      width: 200,
      cellEditor: 'agLargeTextCellEditor',
      cellEditorPopup: true
    },
    {
      field: 'success_stories',
      headerName: 'Success Stories',
      editable: true,
      width: 200,
      cellEditor: 'agLargeTextCellEditor',
      cellEditorPopup: true
    },
    {
      field: 'source_url',
      headerName: 'Source URL',
      editable: true,
      width: 150
    },
    // Timestamps
    {
      field: 'last_verified_at',
      headerName: 'Last Verified',
      editable: true,
      width: 140,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : ''
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 120,
      editable: false,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : ''
    },
    {
      field: 'updated_at',
      headerName: 'Updated',
      width: 120,
      editable: false,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : ''
    },
    {
      headerName: 'Actions',
      width: 140,
      pinned: 'right',
      cellRenderer: ActionsCellRenderer,
      sortable: false,
      filter: false
    }
  ], []);

  // Default column settings
  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    suppressMovable: false
  }), []);

  // Selection changed
  const onSelectionChanged = useCallback(() => {
    const selected = gridRef.current?.api?.getSelectedRows() || [];
    setSelectedRows(selected);
  }, []);

  // Quick filter
  const onQuickFilterChanged = useCallback((value) => {
    setSearchText(value);
    gridRef.current?.api?.setQuickFilter(value);
  }, []);

  // Login form
  if (!isAuthenticated) {
    return (
      <LoginContainer>
        <LoginCard>
          <LockOutlined style={{ fontSize: 48, color: '#667eea', marginBottom: 24 }} />
          <h2>Brand Admin</h2>
          <p>Enter admin credentials to continue</p>
          <Form onFinish={handleLogin} layout="vertical">
            <Form.Item name="email" rules={[{ required: true }]}>
              <Input prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Login
            </Button>
          </Form>
        </LoginCard>
      </LoginContainer>
    );
  }

  return (
    <Container onPaste={handlePaste}>
      <Header>
        <div>
          <h1>Brand Admin</h1>
          <p>Manage PR directory brands - Click any cell to edit, changes auto-save</p>
        </div>
        <Space>
          <Button onClick={handleLogout}>Logout</Button>
        </Space>
      </Header>

      {/* Stats */}
      <StatsRow gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Brands" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Published"
              value={stats.published}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Drafts"
              value={stats.draft}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Unsaved Changes"
              value={unsavedChanges.size}
              valueStyle={{ color: unsavedChanges.size > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </StatsRow>

      {/* Toolbar */}
      <Toolbar>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={addNewBrand}
          >
            Add Brand
          </Button>

          {selectedRows.length > 0 && (
            <>
              <Button
                icon={<CheckCircleOutlined />}
                onClick={() => bulkUpdateStatus('published')}
              >
                Publish ({selectedRows.length})
              </Button>
              <Popconfirm
                title={`Delete ${selectedRows.length} brand(s)?`}
                onConfirm={() => deleteBrands(selectedRows.map(r => r.id))}
              >
                <Button danger icon={<DeleteOutlined />}>
                  Delete ({selectedRows.length})
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>

        <Space>
          <Input
            placeholder="Search brands..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => onQuickFilterChanged(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Button icon={<ReloadOutlined />} onClick={fetchBrands}>
            Refresh
          </Button>
          <Button icon={<ExportOutlined />} onClick={exportToCSV}>
            Export CSV
          </Button>
        </Space>
      </Toolbar>

      {/* Paste hint */}
      <PasteHint>
        <ImportOutlined /> Tip: Copy data from a spreadsheet and paste here to bulk import
      </PasteHint>

      {/* AG Grid */}
      <GridContainer className="ag-theme-alpine">
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onCellValueChanged={onCellValueChanged}
          onSelectionChanged={onSelectionChanged}
          rowSelection="multiple"
          animateRows={true}
          enableCellChangeFlash={true}
          stopEditingWhenCellsLoseFocus={true}
          enterNavigatesVertically={true}
          enterNavigatesVerticallyAfterEdit={true}
          suppressRowClickSelection={true}
          getRowId={(params) => params.data.id?.toString()}
          loading={loading}
          overlayLoadingTemplate='<span class="ag-overlay-loading-center">Loading brands...</span>'
          overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No brands found. Click "Add Brand" to get started!</span>'
        />
      </GridContainer>

      {/* Detail Drawer for complex fields */}
      <Drawer
        title={`Edit ${currentBrand?.name || 'Brand'} Details`}
        placement="right"
        width={600}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        extra={
          <Space>
            <Button onClick={() => setDetailDrawerVisible(false)}>Cancel</Button>
            <Button type="primary" onClick={saveDetailForm} icon={<SaveOutlined />}>
              Save
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Tabs defaultActiveKey="basic">
            <Tabs.TabPane tab="Basic Info" key="basic">
              <Form.Item name="name" label="Brand Name">
                <Input />
              </Form.Item>
              <Form.Item name="slug" label="URL Slug">
                <Input addonBefore="newcollab.co/brand/" />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={4} />
              </Form.Item>
              <Form.Item name="logo" label="Logo URL">
                <Input placeholder="https://..." />
              </Form.Item>
              <Form.Item name="cover_image_url" label="Cover Image URL">
                <Input placeholder="https://..." />
              </Form.Item>
              <Form.Item name="website" label="Website">
                <Input placeholder="https://..." />
              </Form.Item>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Requirements" key="requirements">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="min_followers" label="Minimum Followers">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="max_followers" label="Maximum Followers">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="platforms" label="Platforms">
                <Select mode="multiple" options={PLATFORM_OPTIONS.map(p => ({ label: p, value: p }))} />
              </Form.Item>
              <Form.Item name="regions" label="Regions">
                <Select mode="multiple" options={REGION_OPTIONS.map(r => ({ label: r, value: r }))} />
              </Form.Item>
              <Form.Item name="niches" label="Niches">
                <Select mode="tags" placeholder="Add niches..." />
              </Form.Item>
              <Form.Item name="product_types" label="Product Types">
                <Input placeholder="e.g., Skincare, Makeup, Accessories" />
              </Form.Item>
              <Form.Item name="application_requirements" label="Application Requirements">
                <Input.TextArea rows={3} placeholder="What the brand looks for in applicants..." />
              </Form.Item>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Contact" key="contact">
              <Form.Item name="application_url" label="Application URL">
                <Input placeholder="https://..." />
              </Form.Item>
              <Form.Item name="contact_email" label="PR Contact Email">
                <Input placeholder="pr@brand.com" />
              </Form.Item>
              <Form.Item name="has_application_form" label="Has Application Form" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="application_method" label="Application Method">
                <Select>
                  <Select.Option value="form">Form</Select.Option>
                  <Select.Option value="email">Email</Select.Option>
                  <Select.Option value="dm">DM</Select.Option>
                  <Select.Option value="website">Website</Select.Option>
                  <Select.Option value="other">Other</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="instagram" label="Instagram Handle">
                <Input addonBefore="@" />
              </Form.Item>
              <Form.Item name="tiktok" label="TikTok Handle">
                <Input addonBefore="@" />
              </Form.Item>
              <Form.Item name="youtube" label="YouTube Handle">
                <Input addonBefore="@" />
              </Form.Item>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Collaboration" key="collaboration">
              <Form.Item name="collaboration_type" label="Collaboration Type">
                <Select>
                  <Select.Option value="gifted">Gifted</Select.Option>
                  <Select.Option value="paid">Paid</Select.Option>
                  <Select.Option value="affiliate">Affiliate</Select.Option>
                  <Select.Option value="ambassador">Ambassador</Select.Option>
                  <Select.Option value="mixed">Mixed</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="avg_product_value" label="Average Product Value ($)">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="payment_offered" label="Payment Offered" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="response_rate" label="Response Rate (%)">
                    <InputNumber min={0} max={100} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="avg_response_time_days" label="Avg Response Time (days)">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="total_applications" label="Total Applications">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="total_responses" label="Total Responses">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Tabs.TabPane>

            <Tabs.TabPane tab="SEO" key="seo">
              <Form.Item name="seo_title" label="SEO Title">
                <Input placeholder="Brand Name PR List Application | Newcollab" />
              </Form.Item>
              <Form.Item name="seo_description" label="SEO Description">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Notes" key="notes">
              <Form.Item name="notes" label="Internal Notes">
                <Input.TextArea rows={4} placeholder="Admin notes about this brand..." />
              </Form.Item>
              <Form.Item name="success_stories" label="Success Stories">
                <Input.TextArea rows={4} placeholder="Creator success stories with this brand..." />
              </Form.Item>
              <Form.Item name="source_url" label="Source URL">
                <Input placeholder="Where you found this brand info..." />
              </Form.Item>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Settings" key="settings">
              <Form.Item name="status" label="Status">
                <Select>
                  <Select.Option value="draft">Draft</Select.Option>
                  <Select.Option value="published">Published</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="accepting_pr" label="Accepting PR" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="is_featured" label="Featured Brand" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="open_pr_featured" label="Open PR Featured" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="is_premium" label="Premium Brand" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Tabs.TabPane>
          </Tabs>
        </Form>
      </Drawer>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  h1 {
    margin: 0 0 4px 0;
    font-size: 28px;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: #666;
  }
`;

const StatsRow = styled(Row)`
  margin-bottom: 24px;
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
`;

const PasteHint = styled.div`
  padding: 8px 16px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #1890ff;
`;

const GridContainer = styled.div`
  height: calc(100vh - 340px);
  min-height: 400px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);

  .ag-header-cell-label {
    font-weight: 600;
  }

  .ag-cell-edit-wrapper {
    padding: 0;
  }
`;

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const LoginCard = styled.div`
  background: white;
  padding: 48px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  text-align: center;
  width: 400px;

  h2 {
    margin: 0 0 8px 0;
  }

  p {
    color: #666;
    margin-bottom: 24px;
  }
`;

export default BrandAdmin;
