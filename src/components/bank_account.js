import React, { useState, useEffect } from 'react';
import { Layout, Card, Table, Button, Input, message, Modal, Form, Space, Checkbox } from "antd";
import '../App.css';
import apiClient from './api/api_client';
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
const { Content } = Layout;

function BankAccount({collapsed}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({});
  const [visibleColumns, setVisibleColumns] = useState({
    bank: true,
    account: true,
    account_holder: true,
    description: true,
    actions: true,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [form] = Form.useForm();

  const columnLabels = {
    bank: '은행',
    account: '계좌번호',
    account_holder: '예금주',
    description: '설명',
    actions: '작업',
  };

  const columns = [
    {
      title: '번호',
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
      open: true,
    },
    {
      title: '은행',
      dataIndex: 'bank',
      key: 'bank',
      align: 'center',
      sorter: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Button type="primary" onClick={confirm} style={{ width: '100%' }}>
            검색
          </Button>
          <Button onClick={clearFilters} style={{ width: '100%', marginTop: 8 }}>
            초기화
          </Button>
        </div>
      ),
      onFilter: (value, record) => record.bank.toLowerCase().includes(value.toLowerCase()),
      open: visibleColumns.bank,
    },
    {
      title: '계좌번호',
      dataIndex: 'account',
      key: 'account',
      align: 'center',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Button type="primary" onClick={confirm} style={{ width: '100%' }}>
            Search
          </Button>
          <Button onClick={clearFilters} style={{ width: '100%', marginTop: 8 }}>
            Reset
          </Button>
        </div>
      ),
      onFilter: (value, record) => record.account.toLowerCase().includes(value.toLowerCase()),
      open: visibleColumns.account,
    },
    {
      title: '예금주',
      dataIndex: 'account_holder',
      key: 'account_holder',
      align: 'center',
      sorter: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Button type="primary" onClick={confirm} style={{ width: '100%' }}>
            Search
          </Button>
          <Button onClick={clearFilters} style={{ width: '100%', marginTop: 8 }}>
            Reset
          </Button>
        </div>
      ),
      onFilter: (value, record) => record.account_holder.toLowerCase().includes(value.toLowerCase()),
      open: visibleColumns.account_holderu,
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      align: 'center',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Button type="primary" onClick={confirm} style={{ width: '100%' }}>
            Search
          </Button>
          <Button onClick={clearFilters} style={{ width: '100%', marginTop: 8 }}>
            Reset
          </Button>
        </div>
      ),
      onFilter: (value, record) => record.description.toLowerCase().includes(value.toLowerCase()),
      open: visibleColumns.description,
    },
    {
      title: '작업',
      key: 'actions',
      align: 'center',
      open: visibleColumns.actions,
      render: (text, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          />
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ].filter(column => column.open);

  const getData = async (page = 1, pageSize = 10, ordering = 'bank', filters = {}) => {
    setLoading(true);
    try {
      const params = {
        page: page,
        page_size: pageSize,
        ordering: ordering,
        ...filters,
      };
      const response = await apiClient.get('bank-account', { params });
      setResult(response.data.results);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: response.data.count,
      });
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '선택한 계좌번호를 삭제 하시겠습니까?',
      okText: '확인',
      okType: 'danger',
      cancelText: '취소',
      onOk: async () => {
        try {
          await apiClient.delete(`bank-account/${id}`);
          message.success('계좌번호 삭제에 성공하였습니다.');
          getData(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error('계좌번호 삭제에 실패하였습니다.');
        }
      },
    });
  };

  const showEditModal = (account) => {
    setCurrentAccount(account);
    form.setFieldsValue(account);
    setIsModalVisible(true);
  };

  const handleEdit = async () => {
    try {
      const values = await form.validateFields();
      await apiClient.put(`bank-account/${currentAccount.id}`, values);
      message.success('계좌번호 편집에 성공하였습니다.');
      setIsModalVisible(false);
      getData(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('계좌번호 편집에 실패하였습니다.');
    }
  };

  const showAddModal = () => {
    form.resetFields();
    setIsAddModalVisible(true);
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      await apiClient.post('bank-account', values);
      message.success('계좌번호 추가에 성공하였습니다.');
      setIsAddModalVisible(false);
      getData(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('계좌번호 추가에 실패하였습니다.');
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleTableChange = (pagination, filters, sorter) => {
    const sortField = sorter.field;
    const sortOrder = sorter.order === 'ascend' ? '' : '-';
    const order = sortField ? sortOrder + sortField : 'bank';
    setFilters(filters);
    getData(pagination.current, pagination.pageSize, order, filters);
  };

  const handleColumnVisibilityChange = (columnKey) => {
    setVisibleColumns(prevState => ({
      ...prevState,
      [columnKey]: !prevState[columnKey],
    }));
  };

  return (
    <Layout style={{ marginLeft: collapsed ? 80 : 200 }}>
      <Content style={{ overflow: 'initial' }}>
        <div style={{
          textAlign: 'left',
          maxHeight: '100%',
          maxWidth: '100%',
          display: 'inline',
          flexDirection: 'column',
          justifyContent: 'left',
          color: '#131629',
        }}>
          <Card style={{ padding: '0px 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <Button onClick={() => getData(pagination.current, pagination.pageSize)} style={{ marginRight: 8 }}>
                새로고침
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
                추가
              </Button>
            </div>
            <div style={{ marginBottom: 16 }}>
              {Object.keys(visibleColumns).map(columnKey => (
                <Checkbox
                  key={columnKey}
                  checked={visibleColumns[columnKey]}
                  onChange={() => handleColumnVisibilityChange(columnKey)}
                >
                  {columnLabels[columnKey]}
                </Checkbox>
              ))}
            </div>
            <Table
              dataSource={result}
              columns={columns}
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
              }}
              onChange={handleTableChange}
              rowKey="id"
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </div>
      </Content>
      <Modal
        title="계좌번호 추가"
        open={isAddModalVisible}
        onOk={handleAdd}
        onCancel={() => setIsAddModalVisible(false)}
        okText="확인"
        cancelText="취소"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="bank" label="은행" rules={[{ required: true, message: '은행을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="account" label="계좌번호" rules={[{ required: true, message: '계좌번호를 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="account_holder" label="예금주" rules={[{ required: true, message: '예금주를 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="설명">
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 10 }} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="계좌번호 편집"
        open={isModalVisible}
        onOk={handleEdit}
        onCancel={() => setIsModalVisible(false)}
        okText="확인"
        cancelText="취소"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="bank" label="은행" rules={[{ required: true, message: '은행을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="account" label="계좌번호" rules={[{ required: true, message: '계좌번호를 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="account_holder" label="예금주" rules={[{ required: true, message: '예금주를 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="설명">
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 10 }} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default BankAccount;