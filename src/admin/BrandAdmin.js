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
  Drawer, Switch, InputNumber, Segmented
} from 'antd';
import {
  PlusOutlined, SaveOutlined, DeleteOutlined, UploadOutlined,
  ReloadOutlined, ExportOutlined, ImportOutlined, CopyOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  LockOutlined, UserOutlined, SearchOutlined, FilterOutlined,
  EditOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import api from '../config/api';

// Admin credentials - same as PRHunter
const ADMIN_EMAIL = 'team@newcollab.co';
const ADMIN_PASSWORD = 'Ilovela1992!';

// Category options
import { CATEGORY_OPTIONS } from '../constants/brandCategories';

const CATEGORY_OPTION_VALUES = CATEGORY_OPTIONS.map((o) => o.value);

// Platform options
const PLATFORM_OPTIONS = ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook', 'Pinterest'];

// Region options
const REGION_OPTIONS = ['USA', 'UK', 'Canada', 'Australia', 'Europe', 'Worldwide', 'Asia'];

// ============================================================================
// Bulk Edit config — every field here can be set on many selected brands at
// once (mirrors /api/admin/brands/bulk-update's allowed_fields on the backend)
// ============================================================================
const BULK_EDIT_FIELDS = [
  { group: 'Flags', key: 'micro_friendly', label: 'Micro-friendly', type: 'boolean' },
  { group: 'Flags', key: 'accepting_pr', label: 'Accepting PR', type: 'boolean' },
  { group: 'Flags', key: 'is_featured', label: 'Featured', type: 'boolean' },
  { group: 'Flags', key: 'open_pr_featured', label: 'Open PR Featured', type: 'boolean' },
  { group: 'Flags', key: 'roundup_featured', label: 'Roundup Featured', type: 'boolean' },
  { group: 'Flags', key: 'is_premium', label: 'Premium', type: 'boolean' },
  { group: 'Flags', key: 'has_application_form', label: 'Has Application Form', type: 'boolean' },
  { group: 'Flags', key: 'payment_offered', label: 'Payment Offered', type: 'boolean' },
  { group: 'Status', key: 'status', label: 'Status', type: 'select', options: [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
  ] },
  { group: 'Status', key: 'category', label: 'Category', type: 'select', options: CATEGORY_OPTIONS },
  { group: 'Collaboration', key: 'collaboration_type', label: 'Collaboration Type', type: 'select', options: [
    { value: 'gifted', label: 'Gifted' },
    { value: 'paid', label: 'Paid' },
    { value: 'affiliate', label: 'Affiliate' },
    { value: 'ambassador', label: 'Ambassador' },
    { value: 'mixed', label: 'Mixed' },
  ] },
  { group: 'Collaboration', key: 'application_method', label: 'Application Method', type: 'select', options: [
    { value: 'form', label: 'Form' },
    { value: 'email', label: 'Email' },
    { value: 'dm', label: 'DM' },
    { value: 'website', label: 'Website' },
    { value: 'other', label: 'Other' },
  ] },
  { group: 'Collaboration', key: 'tone', label: 'Tone', type: 'select', options: [
    'premium', 'casual', 'wellness', 'functional', 'luxury', 'playful', 'minimalist', 'bold'
  ].map(v => ({ value: v, label: v[0].toUpperCase() + v.slice(1) })) },
  { group: 'Requirements', key: 'platforms', label: 'Platforms', type: 'multiselect', options: PLATFORM_OPTIONS.map(p => ({ value: p, label: p })) },
  { group: 'Requirements', key: 'regions', label: 'Regions', type: 'multiselect', options: REGION_OPTIONS.map(r => ({ value: r, label: r })) },
  { group: 'Requirements', key: 'niches', label: 'Niches', type: 'tags' },
  { group: 'Requirements', key: 'min_followers', label: 'Min Followers', type: 'number', min: 0 },
  { group: 'Requirements', key: 'max_followers', label: 'Max Followers', type: 'number', min: 0 },
  { group: 'Stats', key: 'response_rate', label: 'Response Rate (%)', type: 'number', min: 0, max: 100 },
  { group: 'Stats', key: 'avg_response_time_days', label: 'Avg Response Time (days)', type: 'number', min: 0 },
  { group: 'Stats', key: 'price_point', label: 'Price Point ($)', type: 'number', min: 0 },
  { group: 'Stats', key: 'avg_product_value', label: 'Avg Product Value ($)', type: 'number', min: 0 },
];

const BULK_EDIT_GROUPS = [...new Set(BULK_EDIT_FIELDS.map(f => f.group))];

const defaultBulkValueFor = (fieldKey) => {
  const conf = BULK_EDIT_FIELDS.find(f => f.key === fieldKey);
  if (!conf) return undefined;
  if (conf.type === 'boolean') return true;
  if (conf.type === 'multiselect' || conf.type === 'tags') return [];
  return undefined;
};

const formatBulkValueForDisplay = (conf, value) => {
  if (!conf) return '';
  if (conf.type === 'boolean') return value ? 'Yes' : 'No';
  if (conf.type === 'select') return conf.options.find(o => o.value === value)?.label || value;
  if (conf.type === 'multiselect' || conf.type === 'tags') {
    return Array.isArray(value) && value.length ? value.join(', ') : '(empty)';
  }
  return String(value);
};

const BrandAdmin = () => {
  const gridRef = useRef();
  const isReverting = useRef(false);
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
  const [bulkEditVisible, setBulkEditVisible] = useState(false);
  const [bulkField, setBulkField] = useState(null);
  const [bulkValue, setBulkValue] = useState(undefined);
  const [bulkApplying, setBulkApplying] = useState(false);
  const [bulkEnriching, setBulkEnriching] = useState(false);

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
    if (isReverting.current) return;

    const { data, colDef, newValue, oldValue } = params;

    if (newValue === oldValue) return;

    // Use the value from row data (already converted by valueSetter for boolean columns)
    // rather than newValue which may be a raw string ('Yes'/'No') or undefined
    const valueToSave = data[colDef.field];

    if (valueToSave === undefined && newValue === undefined) return;

    // Mark as having unsaved changes
    setUnsavedChanges(prev => new Set(prev).add(data.id));

    try {
      await api.patch(
        `/api/admin/brands/${data.id}`,
        { [colDef.field]: valueToSave },
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
      const apiMsg = error.response?.data?.error;
      if (error.response?.status === 409 && apiMsg) {
        message.error(apiMsg, 5);
      } else {
        message.error(`Failed to save ${colDef.headerName}`);
      }
      // Revert the cell to its previous value
      isReverting.current = true;
      params.node.setDataValue(colDef.field, oldValue);
      isReverting.current = false;
    }
  }, []);

  // Add new brand
  const addNewBrand = async () => {
    const timestamp = Date.now();
    const newBrand = {
      name: `New Brand ${timestamp}`,
      slug: `new-brand-${timestamp}`,
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

  // Reset and open the bulk edit panel for the currently selected rows
  const openBulkEdit = () => {
    setBulkField(null);
    setBulkValue(undefined);
    setBulkEditVisible(true);
  };

  // Apply one field/value to every selected brand in a single request
  const applyBulkEdit = async () => {
    const fieldConf = BULK_EDIT_FIELDS.find(f => f.key === bulkField);
    if (!fieldConf) {
      message.warning('Choose a field to edit');
      return;
    }
    if (bulkValue === undefined || bulkValue === null || bulkValue === '') {
      message.warning('Set a value to apply');
      return;
    }

    const ids = selectedRows.map(r => r.id);
    setBulkApplying(true);
    try {
      await api.post(
        '/api/admin/brands/bulk-update',
        { ids, updates: { [bulkField]: bulkValue } },
        getApiConfig()
      );

      setRowData(prev => prev.map(b =>
        ids.includes(b.id) ? { ...b, [bulkField]: bulkValue } : b
      ));

      message.success(`Updated "${fieldConf.label}" for ${ids.length} brand${ids.length === 1 ? '' : 's'}`);
      setBulkEditVisible(false);
      setBulkField(null);
      setBulkValue(undefined);
    } catch (error) {
      console.error('Bulk edit failed:', error);
      message.error(error.response?.data?.error || 'Bulk edit failed');
    } finally {
      setBulkApplying(false);
    }
  };

  // Bulk AI enrich selected brands
  const bulkAiEnrich = async () => {
    const ids = selectedRows.map(r => r.id);
    const brandsWithoutWebsite = selectedRows.filter(r => !r.website);

    if (brandsWithoutWebsite.length > 0) {
      message.warning(`${brandsWithoutWebsite.length} brand(s) have no website and will be skipped`);
    }

    setBulkEnriching(true);
    const key = 'bulk-enrich';
    message.loading({ content: `AI enriching ${ids.length} brands...`, key, duration: 0 });

    try {
      const { data } = await api.post(
        '/api/admin/brands/bulk-enrich',
        { ids, only_missing_fields: true },
        getApiConfig()
      );

      if (data.success) {
        // Refresh the grid to show enriched data
        await fetchBrands();
        message.success({
          content: `Successfully enriched ${data.enriched} of ${data.total} brands`,
          key
        });
        setSelectedRows([]);
        gridRef.current?.api?.deselectAll();
      } else {
        message.error({ content: data.error || 'Bulk enrichment failed', key });
      }
    } catch (error) {
      console.error('Bulk enrichment failed:', error);
      message.error({
        content: error.response?.data?.error || 'Bulk enrichment failed',
        key
      });
    } finally {
      setBulkEnriching(false);
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

  // Batch fill missing logos from Clearbit
  const fillMissingLogos = async () => {
    const brandsToFill = rowData.filter(b => b.website && !b.logo);
    if (brandsToFill.length === 0) {
      message.info('All brands with websites already have logos');
      return;
    }

    message.loading({ content: `Filling logos for ${brandsToFill.length} brands...`, key: 'logos', duration: 0 });

    let filled = 0;
    for (const brand of brandsToFill) {
      try {
        const url = new URL(brand.website.startsWith('http') ? brand.website : `https://${brand.website}`);
        const domain = url.hostname.replace('www.', '');
        const logoUrl = `https://logo.clearbit.com/${domain}`;

        await api.patch(`/api/admin/brands/${brand.id}`, { logo: logoUrl }, getApiConfig());
        brand.logo = logoUrl;
        filled++;
      } catch (e) { /* skip invalid URLs */ }
    }

    gridRef.current?.api?.refreshCells({ force: true });
    message.success({ content: `Filled ${filled} logos`, key: 'logos' });
  };

  // Import from clipboard (paste handler)
  const handlePaste = useCallback(async (e) => {
    // Skip bulk import if user is editing a cell or input field
    const activeElement = document.activeElement;
    const isEditing = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.isContentEditable ||
      activeElement.closest('.ag-cell-edit-wrapper') ||
      activeElement.closest('.ag-popup-editor')
    );
    if (isEditing) return;

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

  // AI Enrich brand data (hero_product, target_audience, tone, etc.)
  const aiEnrichBrand = async (brand, refreshRow) => {
    if (!brand.website) {
      message.warning('No website URL to enrich from');
      return;
    }

    try {
      message.loading({ content: 'AI enriching brand data...', key: 'enrich', duration: 0 });
      const { data } = await api.post(
        `/api/admin/brands/${brand.id}/enrich`,
        {},
        getApiConfig()
      );

      if (data.success) {
        // Update local row data with all enriched fields
        Object.assign(brand, {
          hero_product: data.data.hero_product || brand.hero_product,
          target_audience: data.data.target_audience || brand.target_audience,
          tone: data.data.tone || brand.tone,
          price_point: data.data.price_point || brand.price_point,
          enriched_at: new Date().toISOString(),
          // New enrichment fields
          instagram_handle: data.data.instagram_handle || brand.instagram_handle,
          tiktok_handle: data.data.tiktok_handle || brand.tiktok_handle,
          youtube_handle: data.data.youtube_handle || brand.youtube_handle,
          min_followers: data.data.min_followers || brand.min_followers,
          collaboration_type: data.data.collaboration_type || brand.collaboration_type,
          seo_title: data.data.seo_title || brand.seo_title,
          seo_description: data.data.seo_description || brand.seo_description,
          success_stories: data.data.success_stories || brand.success_stories,
          response_rate: data.data.response_rate || brand.response_rate,
          avg_response_time_days: data.data.avg_response_time_days || brand.avg_response_time_days
        });
        if (data.data.description && !brand.description) {
          brand.description = data.data.description;
        }
        refreshRow();
        const fieldsEnriched = Object.keys(data.data).filter(k => data.data[k]).length;
        message.success({ content: `Enriched ${fieldsEnriched} fields: ${data.data.hero_product || 'done'}`, key: 'enrich' });
      } else {
        message.warning({ content: data.error || 'Enrichment failed', key: 'enrich' });
      }
    } catch (error) {
      console.error('Enrich failed:', error);
      message.error({ content: 'Enrichment failed', key: 'enrich' });
    }
  };

  // Scrape OpenGraph data from website
  const scrapeWebsiteData = async (brand, refreshRow) => {
    if (!brand.website) {
      message.warning('No website URL to scrape');
      return;
    }

    try {
      message.loading({ content: 'Fetching website data...', key: 'scrape' });
      const { data } = await api.post(
        '/api/admin/brands/scrape-og',
        { url: brand.website },
        getApiConfig()
      );

      if (data.success) {
        const updates = {};
        if (data.title && !brand.name) updates.name = data.title;
        if (data.description && !brand.description) updates.description = data.description;
        if (data.image && !brand.cover_image_url) updates.cover_image_url = data.image;
        if (data.instagram && !brand.instagram) updates.instagram = data.instagram;

        if (Object.keys(updates).length > 0) {
          await api.patch(`/api/admin/brands/${brand.id}`, updates, getApiConfig());
          Object.assign(brand, updates);
          refreshRow();
          message.success({ content: `Filled ${Object.keys(updates).length} fields`, key: 'scrape' });
        } else {
          message.info({ content: 'No empty fields to fill', key: 'scrape' });
        }
      } else {
        message.warning({ content: 'Could not fetch website data', key: 'scrape' });
      }
    } catch (error) {
      message.error({ content: 'Scrape failed', key: 'scrape' });
    }
  };

  // Actions cell renderer
  const ActionsCellRenderer = (params) => {
    const refreshRow = () => {
      params.api.refreshCells({ rowNodes: [params.node], force: true });
    };

    return (
      <Space size="small">
        <Tooltip title="AI Enrich (hero product, audience, tone)">
          <Button
            size="small"
            type={params.data.enriched_at ? 'default' : 'primary'}
            icon={<span role="img" aria-label="ai">🤖</span>}
            onClick={() => aiEnrichBrand(params.data, refreshRow)}
            disabled={!params.data.website}
          />
        </Tooltip>
        <Tooltip title="Auto-fill from website">
          <Button
            size="small"
            icon={<ImportOutlined />}
            onClick={() => scrapeWebsiteData(params.data, refreshRow)}
            disabled={!params.data.website}
          />
        </Tooltip>
        <Tooltip title="Edit Details">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openDetailDrawer(params.data)}
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
      lockPosition: true,
      headerCheckboxSelectionFilteredOnly: true  // Only select filtered rows
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
      cellEditorParams: { values: CATEGORY_OPTION_VALUES }
    },
    {
      field: 'website',
      headerName: 'Website',
      editable: true,
      width: 200,
      cellRenderer: (params) => {
        if (params.value) {
          const url = params.value.startsWith('http') ? params.value : `https://${params.value}`;
          return (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ color: '#1890ff', textDecoration: 'none' }}
            >
              {params.value}
            </a>
          );
        }
        return null;
      },
      // Auto-fill logo from Clearbit when website changes
      onCellValueChanged: (params) => {
        if (params.newValue && params.newValue !== params.oldValue) {
          try {
            const url = new URL(params.newValue.startsWith('http') ? params.newValue : `https://${params.newValue}`);
            const domain = url.hostname.replace('www.', '');
            const logoUrl = `https://logo.clearbit.com/${domain}`;
            // Only auto-fill if logo is empty
            if (!params.data.logo) {
              params.data.logo = logoUrl;
              params.api.refreshCells({ rowNodes: [params.node], columns: ['logo'], force: true });
              // Save logo to backend
              api.patch(`/api/admin/brands/${params.data.id}`, { logo: logoUrl }, { headers: { 'X-Admin-Token': 'pr-hunter-admin-2026' } });
            }
          } catch (e) { /* invalid URL, skip */ }
        }
      }
    },
    // PR Contact fields - most important for data entry
    {
      field: 'contact_email',
      headerName: '📧 PR Email',
      editable: true,
      width: 200,
      cellStyle: { backgroundColor: '#fffbe6' }
    },
    {
      field: 'application_url',
      headerName: '🔗 PR Form URL',
      editable: true,
      width: 220,
      cellStyle: { backgroundColor: '#fffbe6' }
    },
    {
      field: 'logo',
      headerName: 'Logo URL',
      editable: true,
      width: 150,
      cellRenderer: (params) => {
        if (params.value) {
          return (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img src={params.value} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{params.value}</span>
            </span>
          );
        }
        return null;
      }
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
    // AI Enrichment fields
    {
      field: 'hero_product',
      headerName: '🎯 Hero Product',
      editable: true,
      width: 200,
      cellStyle: { backgroundColor: '#f0fdf4' }
    },
    {
      field: 'target_audience',
      headerName: '👥 Target Audience',
      editable: true,
      width: 220,
      cellStyle: { backgroundColor: '#f0fdf4' }
    },
    {
      field: 'tone',
      headerName: '🎨 Tone',
      editable: true,
      width: 120,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ['premium', 'casual', 'wellness', 'functional', 'luxury', 'playful', 'minimalist', 'bold'] },
      cellStyle: { backgroundColor: '#f0fdf4' }
    },
    {
      field: 'price_point',
      headerName: '💰 Price',
      editable: true,
      width: 100,
      valueFormatter: (params) => params.value ? `$${params.value}` : '',
      cellStyle: { backgroundColor: '#f0fdf4' }
    },
    {
      field: 'enriched_at',
      headerName: '🤖 Enriched',
      width: 120,
      editable: false,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : '',
      cellRenderer: (params) => {
        if (params.value) {
          return <Tag color="green" style={{ fontSize: 10 }}>✓ {new Date(params.value).toLocaleDateString()}</Tag>;
        }
        return <Tag color="default" style={{ fontSize: 10 }}>Not enriched</Tag>;
      }
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
    // Application info (PR Email and PR Form URL moved to top)
    {
      field: 'has_application_form',
      headerName: 'Has App Form',
      editable: false,
      width: 110,
      cellRenderer: (params) => {
        const toggle = async () => {
          const newVal = !params.data.has_application_form;
          params.data.has_application_form = newVal;
          params.api.refreshCells({ rowNodes: [params.node], columns: ['has_application_form'], force: true });
          try {
            await api.patch(`/api/admin/brands/${params.data.id}`, { has_application_form: newVal }, { headers: { 'X-Admin-Token': 'pr-hunter-admin-2026' } });
            message.success('Updated Has App Form', 1);
          } catch (e) {
            params.data.has_application_form = !newVal;
            params.api.refreshCells({ rowNodes: [params.node], columns: ['has_application_form'], force: true });
            message.error('Failed to save');
          }
        };
        return <Tag color={params.value ? 'green' : 'default'} style={{ cursor: 'pointer' }} onClick={toggle}>{params.value ? 'Yes' : 'No'}</Tag>;
      }
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
      editable: false,
      width: 120,
      cellRenderer: (params) => {
        const toggle = async () => {
          const newVal = !params.data.payment_offered;
          params.data.payment_offered = newVal;
          params.api.refreshCells({ rowNodes: [params.node], columns: ['payment_offered'], force: true });
          try {
            await api.patch(`/api/admin/brands/${params.data.id}`, { payment_offered: newVal }, { headers: { 'X-Admin-Token': 'pr-hunter-admin-2026' } });
            message.success('Updated Payment Offered', 1);
          } catch (e) {
            params.data.payment_offered = !newVal;
            params.api.refreshCells({ rowNodes: [params.node], columns: ['payment_offered'], force: true });
            message.error('Failed to save');
          }
        };
        return <Tag color={params.value ? 'green' : 'default'} style={{ cursor: 'pointer' }} onClick={toggle}>{params.value ? 'Yes' : 'No'}</Tag>;
      }
    },
    // Flags
    {
      field: 'accepting_pr',
      headerName: 'Accepting PR',
      editable: false,
      width: 110,
      cellRenderer: (params) => {
        const toggle = async () => {
          const newVal = !params.data.accepting_pr;
          params.data.accepting_pr = newVal;
          params.api.refreshCells({ rowNodes: [params.node], columns: ['accepting_pr'], force: true });
          try {
            await api.patch(`/api/admin/brands/${params.data.id}`, { accepting_pr: newVal }, { headers: { 'X-Admin-Token': 'pr-hunter-admin-2026' } });
            message.success('Updated Accepting PR', 1);
          } catch (e) {
            params.data.accepting_pr = !newVal;
            params.api.refreshCells({ rowNodes: [params.node], columns: ['accepting_pr'], force: true });
            message.error('Failed to save');
          }
        };
        return <Tag color={params.value ? 'green' : 'red'} style={{ cursor: 'pointer' }} onClick={toggle}>{params.value ? 'Yes' : 'No'}</Tag>;
      }
    },
    {
      field: 'is_featured',
      headerName: 'Featured',
      editable: false,
      width: 100,
      cellRenderer: (params) => {
        const toggle = async () => {
          const newVal = !params.data.is_featured;
          params.data.is_featured = newVal;
          params.api.refreshCells({ rowNodes: [params.node], columns: ['is_featured'], force: true });
          try {
            await api.patch(`/api/admin/brands/${params.data.id}`, { is_featured: newVal }, { headers: { 'X-Admin-Token': 'pr-hunter-admin-2026' } });
            message.success('Updated Featured', 1);
          } catch (e) {
            params.data.is_featured = !newVal;
            params.api.refreshCells({ rowNodes: [params.node], columns: ['is_featured'], force: true });
            message.error('Failed to save');
          }
        };
        return <Tag color={params.value ? 'gold' : 'default'} style={{ cursor: 'pointer' }} onClick={toggle}>{params.value ? 'Yes' : 'No'}</Tag>;
      }
    },
    {
      field: 'open_pr_featured',
      headerName: 'Open PR',
      editable: false,
      width: 100,
      cellRenderer: (params) => {
        const toggle = async () => {
          const newVal = !params.data.open_pr_featured;
          params.data.open_pr_featured = newVal;
          params.api.refreshCells({ rowNodes: [params.node], columns: ['open_pr_featured'], force: true });
          try {
            await api.patch(`/api/admin/brands/${params.data.id}`, { open_pr_featured: newVal }, { headers: { 'X-Admin-Token': 'pr-hunter-admin-2026' } });
            message.success('Updated Open PR', 1);
          } catch (e) {
            params.data.open_pr_featured = !newVal;
            params.api.refreshCells({ rowNodes: [params.node], columns: ['open_pr_featured'], force: true });
            message.error('Failed to save');
          }
        };
        return <Tag color={params.value ? 'cyan' : 'default'} style={{ cursor: 'pointer' }} onClick={toggle}>{params.value ? 'Yes' : 'No'}</Tag>;
      }
    },
    {
      field: 'micro_friendly',
      headerName: 'Micro-friendly',
      editable: false,
      width: 120,
      cellRenderer: (params) => {
        const toggle = async () => {
          const newVal = !params.data.micro_friendly;
          params.data.micro_friendly = newVal;
          params.api.refreshCells({ rowNodes: [params.node], columns: ['micro_friendly'], force: true });
          try {
            await api.patch(`/api/admin/brands/${params.data.id}`, { micro_friendly: newVal }, { headers: { 'X-Admin-Token': 'pr-hunter-admin-2026' } });
            message.success('Updated Micro-friendly', 1);
          } catch (e) {
            params.data.micro_friendly = !newVal;
            params.api.refreshCells({ rowNodes: [params.node], columns: ['micro_friendly'], force: true });
            message.error('Failed to save');
          }
        };
        return <Tag color={params.value ? 'green' : 'default'} style={{ cursor: 'pointer' }} onClick={toggle}>{params.value ? 'Yes' : 'No'}</Tag>;
      }
    },
    {
      field: 'roundup_featured',
      headerName: '📧 Roundup',
      editable: false,
      width: 115,
      cellRenderer: (params) => {
        const toggle = async () => {
          const newVal = !params.data.roundup_featured;
          params.data.roundup_featured = newVal;
          params.api.refreshCells({ rowNodes: [params.node], columns: ['roundup_featured'], force: true });
          try {
            await api.patch(`/api/admin/brands/${params.data.id}`, { roundup_featured: newVal }, { headers: { 'X-Admin-Token': 'pr-hunter-admin-2026' } });
            message.success('Updated Roundup', 1);
          } catch (e) {
            params.data.roundup_featured = !newVal;
            params.api.refreshCells({ rowNodes: [params.node], columns: ['roundup_featured'], force: true });
            message.error('Failed to save');
          }
        };
        return <Tag color={params.value ? 'magenta' : 'default'} style={{ cursor: 'pointer' }} onClick={toggle}>{params.value ? '✓ In Roundup' : 'No'}</Tag>;
      }
    },
    {
      field: 'is_premium',
      headerName: 'Premium',
      editable: false,
      width: 100,
      cellRenderer: (params) => {
        const toggle = async () => {
          const newVal = !params.data.is_premium;
          params.data.is_premium = newVal;
          params.api.refreshCells({ rowNodes: [params.node], columns: ['is_premium'], force: true });
          try {
            await api.patch(`/api/admin/brands/${params.data.id}`, { is_premium: newVal }, { headers: { 'X-Admin-Token': 'pr-hunter-admin-2026' } });
            message.success('Updated Premium', 1);
          } catch (e) {
            params.data.is_premium = !newVal;
            params.api.refreshCells({ rowNodes: [params.node], columns: ['is_premium'], force: true });
            message.error('Failed to save');
          }
        };
        return <Tag color={params.value ? 'purple' : 'default'} style={{ cursor: 'pointer' }} onClick={toggle}>{params.value ? 'Yes' : 'No'}</Tag>;
      }
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
      width: 160,
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
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={openBulkEdit}
              >
                Bulk Edit ({selectedRows.length})
              </Button>
              <Button
                type="primary"
                icon={<span role="img" aria-label="ai">🤖</span>}
                onClick={bulkAiEnrich}
                loading={bulkEnriching}
                disabled={bulkEnriching}
              >
                Bulk AI Enrich ({selectedRows.length})
              </Button>
              <Button
                icon={<CheckCircleOutlined />}
                onClick={() => bulkUpdateStatus('published')}
              >
                Publish
              </Button>
              <Button
                icon={<CloseCircleOutlined />}
                onClick={() => bulkUpdateStatus('draft')}
              >
                Unpublish
              </Button>
              <Popconfirm
                title={`Delete ${selectedRows.length} brand(s)?`}
                onConfirm={() => deleteBrands(selectedRows.map(r => r.id))}
              >
                <Button danger icon={<DeleteOutlined />}>
                  Delete
                </Button>
              </Popconfirm>
              <Button type="link" onClick={() => gridRef.current?.api?.deselectAll()}>
                Clear selection
              </Button>
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
          <Button onClick={fillMissingLogos}>
            Fill Missing Logos
          </Button>
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
          theme="legacy"
          overlayLoadingTemplate='<span class="ag-overlay-loading-center">Loading brands...</span>'
          overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No brands found. Click "Add Brand" to get started!</span>'
        />
      </GridContainer>

      {/* Bulk Edit — set one field to one value across every selected brand */}
      <Modal
        title={`Bulk Edit — ${selectedRows.length} brand${selectedRows.length === 1 ? '' : 's'} selected`}
        open={bulkEditVisible}
        onCancel={() => setBulkEditVisible(false)}
        footer={null}
        width={480}
        destroyOnClose
      >
        {(() => {
          const fieldConf = BULK_EDIT_FIELDS.find(f => f.key === bulkField);
          const canApply = !!fieldConf && bulkValue !== undefined && bulkValue !== null && bulkValue !== '';

          return (
            <>
              <BulkFieldLabel>Field to update</BulkFieldLabel>
              <Select
                style={{ width: '100%' }}
                placeholder="Choose a field..."
                value={bulkField}
                onChange={(val) => { setBulkField(val); setBulkValue(defaultBulkValueFor(val)); }}
                showSearch
                optionFilterProp="label"
              >
                {BULK_EDIT_GROUPS.map(group => (
                  <Select.OptGroup key={group} label={group}>
                    {BULK_EDIT_FIELDS.filter(f => f.group === group).map(f => (
                      <Select.Option key={f.key} value={f.key} label={f.label}>{f.label}</Select.Option>
                    ))}
                  </Select.OptGroup>
                ))}
              </Select>

              {fieldConf && (
                <>
                  <BulkFieldLabel style={{ marginTop: 20 }}>New value</BulkFieldLabel>
                  {fieldConf.type === 'boolean' && (
                    <Segmented
                      block
                      options={[
                        { label: '✓ Yes', value: true },
                        { label: '✕ No', value: false },
                      ]}
                      value={bulkValue}
                      onChange={setBulkValue}
                    />
                  )}
                  {fieldConf.type === 'select' && (
                    <Select
                      style={{ width: '100%' }}
                      placeholder="Choose value..."
                      value={bulkValue}
                      onChange={setBulkValue}
                      options={fieldConf.options}
                    />
                  )}
                  {(fieldConf.type === 'multiselect' || fieldConf.type === 'tags') && (
                    <>
                      <Select
                        mode={fieldConf.type === 'tags' ? 'tags' : 'multiple'}
                        style={{ width: '100%' }}
                        placeholder={fieldConf.type === 'tags' ? 'Type niches and press enter...' : 'Choose values...'}
                        value={bulkValue}
                        onChange={setBulkValue}
                        options={fieldConf.options}
                      />
                      <BulkHint>This replaces the existing value on every selected brand.</BulkHint>
                    </>
                  )}
                  {fieldConf.type === 'number' && (
                    <InputNumber
                      style={{ width: '100%' }}
                      min={fieldConf.min}
                      max={fieldConf.max}
                      value={bulkValue}
                      onChange={setBulkValue}
                    />
                  )}
                </>
              )}

              <BulkFooter>
                <Button onClick={() => setBulkEditVisible(false)}>Cancel</Button>
                <Popconfirm
                  title={fieldConf ? `Set "${fieldConf.label}" to ${formatBulkValueForDisplay(fieldConf, bulkValue)} for ${selectedRows.length} brand(s)?` : ''}
                  onConfirm={applyBulkEdit}
                  okText="Apply"
                  disabled={!canApply}
                >
                  <Button type="primary" icon={<SaveOutlined />} disabled={!canApply} loading={bulkApplying}>
                    Apply to {selectedRows.length} brand{selectedRows.length === 1 ? '' : 's'}
                  </Button>
                </Popconfirm>
              </BulkFooter>
            </>
          );
        })()}
      </Modal>

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
              <Form.Item
                name="micro_friendly"
                label="Micro-friendly"
                valuePropName="checked"
                tooltip="Brand genuinely works with micro-creators. Powers the Micro-friendly badge and the 'Accepts under 10k' filter in Discover."
              >
                <Switch />
              </Form.Item>
              <Form.Item name="roundup_featured" label="📧 Feature in Next Roundup" valuePropName="checked">
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

const BulkFieldLabel = styled.label`
  display: block;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 6px;
  color: #333;
`;

const BulkHint = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 6px;
`;

const BulkFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
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
