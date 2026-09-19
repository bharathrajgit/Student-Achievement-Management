// src/pages/coordinator/exam/ExamReports.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { Sidebar } from '../../../components/Sidebar';
import { Header } from '../../../components/Header';
import { AppToast } from '../../../components/AppToast';
import { exportAllRegistrations } from '../../../services/coordinatorExamService';
import { FiDownload } from 'react-icons/fi';

const Layout = styled.div`
  display: flex;
`;

const Main = styled.main`
  flex: 1;
  margin-left: 280px;
  margin-top: 80px;
  padding: 32px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  min-height: calc(100vh - 80px);

  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 70px;
    padding: 16px;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 32px;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1a202c;
    margin: 0 0 8px 0;
  }

  p {
    color: #718096;
    margin: 0;
    font-size: 14px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-top: 4px solid #667eea;

  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #1a202c;
    margin: 0 0 8px 0;
  }

  p {
    color: #6b7280;
    font-size: 14px;
    margin: 0 0 16px 0;
    line-height: 1.6;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default function ExamReports() {
  const [loading, setLoading] = useState(null);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const handleExport = async (type) => {  // type = 'xlsx', 'csv', or 'pdf'
  try {
    setLoading(type);  // Shows loading state
    
    // 1. Call API with format
    const response = await exportAllRegistrations({ format: type });
    
    // 2. Create blob from response
    const blob = type === 'csv' 
      ? new Blob([response], { type: 'text/csv' })  // CSV is text
      : new Blob([response], { type: 'application/pdf' });  // PDF is binary
    
    // 3. Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 4. Set filename with correct extension
    const extension = type === 'csv' ? 'csv' : type === 'pdf' ? 'pdf' : 'xlsx';
    const filename = `exam-registrations-${new Date().toISOString().split('T')[0]}.${extension}`;
    link.setAttribute('download', filename);
    
    // 5. Trigger download
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    // 6. Show success message
    showToast('success', `Report exported as ${type.toUpperCase()}`);
  } catch (error) {
    showToast('danger', error.message);
  } finally {
    setLoading(null);
  }
};



  return (
    <Layout>
      <Sidebar />
      <Header />
      <Main>
        <PageHeader>
          <h1>📊 Exam Reports</h1>
          <p>Export exam data and generate reports</p>
        </PageHeader>

        <Grid>
          <Card>
            <h3>📋 All Registrations</h3>
            <p>Export all exam registrations with student details and status information.</p>
            <Button onClick={() => handleExport('xlsx')} disabled={loading !== null}>
              <FiDownload size={16} />
              {loading === 'xlsx' ? 'Exporting...' : 'Export as Excel'}
            </Button>
          </Card>

          <Card>
            <h3>📄 CSV Report</h3>
            <p>Export exam registrations in CSV format for spreadsheet analysis.</p>
            <Button onClick={() => handleExport('csv')} disabled={loading !== null}>
              <FiDownload size={16} />
              {loading === 'csv' ? 'Exporting...' : 'Export as CSV'}
            </Button>
          </Card>

          <Card>
            <h3>📊 Summary Report</h3>
            <p>Generate a comprehensive summary of exam analytics and student performance.</p>
            <Button onClick={() => handleExport('pdf')} disabled={loading !== null}>
              <FiDownload size={16} />
              {loading === 'pdf' ? 'Exporting...' : 'Export as PDF'}
            </Button>
          </Card>
        </Grid>
      </Main>

      {toast.show && (
        <AppToast
          show={toast.show}
          onClose={() => setToast({ show: false, type: '', message: '' })}
          type={toast.type}
          message={toast.message}
        />
      )}
    </Layout>
  );
}
