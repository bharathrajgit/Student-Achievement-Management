import React, { useState } from 'react';
import styled from 'styled-components';
import api from '../services/api';
import { FiUpload, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    color: #64748b;
    font-size: 24px;

    &:hover {
      color: #1e293b;
    }
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const Section = styled.div`
  margin-bottom: 24px;

  h3 {
    font-size: 14px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 12px 0;
    text-transform: uppercase;
  }
`;

const DropZone = styled.div`
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #667eea;
    background: #ede9fe;
  }

  input {
    display: none;
  }

  svg {
    font-size: 40px;
    color: #667eea;
    margin-bottom: 12px;
  }

  p {
    margin: 0;
    color: #64748b;

    strong {
      color: #667eea;
    }
  }
`;

const Instructions = styled.div`
  background: #f8fafc;
  border-left: 3px solid #667eea;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  color: #475569;
  line-height: 1.6;

  strong {
    display: block;
    margin-bottom: 8px;
    color: #1e293b;
  }
`;

const ProgressSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ProgressItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${props => props.$type === 'success' ? '#ecfdf5' : '#fef2f2'};
  border-radius: 6px;
  border-left: 3px solid ${props => props.$type === 'success' ? '#10b981' : '#ef4444'};

  svg {
    color: ${props => props.$type === 'success' ? '#10b981' : '#ef4444'};
    flex-shrink: 0;
  }

  div {
    font-size: 13px;

    strong {
      display: block;
      color: #1e293b;
    }

    small {
      color: #64748b;
    }
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #5568d3;
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;

export function BulkMarkUpload({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please drop a CSV file');
    }
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const record = {};
      headers.forEach((header, idx) => {
        record[header] = values[idx] || '';
      });
      records.push(record);
    }

    return records;
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    try {
      setLoading(true);
      const text = await file.text();
      const records = parseCSV(text);

      if (records.length === 0) {
        setError('No data found in CSV');
        return;
      }

      const response = await api.post('/coordinator/nptel/bulk-upload-marks', { records });
      setResult(response.data.data);
      onSuccess?.();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload marks');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>Bulk Upload Marks</h2>
          <button onClick={onClose}>
            <FiX />
          </button>
        </ModalHeader>

        <ModalBody>
          {!result ? (
            <>
              <Section>
                <h3>Upload CSV File</h3>
                <DropZone
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => document.getElementById('csvInput').click()}
                >
                  <FiUpload />
                  <p>
                    <strong>Click to select</strong> or drag and drop your CSV file
                  </p>
                  <input
                    id="csvInput"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                  />
                </DropZone>
                {file && <p style={{ marginTop: '12px', color: '#10b981', fontSize: '14px' }}>✓ {file.name}</p>}
              </Section>

              <Section>
                <h3>CSV Format</h3>
                <Instructions>
                  <strong>Required columns:</strong>
                  rollNumber, examName, marksObtained, totalMarks
                  <br />
                  <strong>Optional:</strong> certificateLink (Google Drive link for passed exams)
                </Instructions>
              </Section>

              {error && (
                <Section>
                  <p style={{ color: '#ef4444', fontSize: '14px' }}>⚠️ {error}</p>
                </Section>
              )}

              <SubmitButton onClick={handleSubmit} disabled={!file || loading}>
                {loading ? 'Uploading...' : 'Upload & Process'}
              </SubmitButton>
            </>
          ) : (
            <>
              <Section>
                <h3>Upload Summary</h3>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '18px', fontWeight: '700', margin: '12px 0' }}>
                    ✓ Processing Complete
                  </p>
                  <p style={{ color: '#64748b' }}>
                    {result.summary.successCount} successful, {result.summary.failureCount} failed
                  </p>
                </div>
              </Section>

              <Section>
                <h3>Successful Updates ({result.successful.length})</h3>
                <ProgressSection style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {result.successful.map((item, idx) => (
                    <ProgressItem key={idx} $type="success">
                      <FiCheckCircle size={16} />
                      <div>
                        <strong>{item.rollNumber} - {item.examName}</strong>
                        <small>Marks: {item.marksObtained}/{item.totalMarks} • Status: {item.status}</small>
                      </div>
                    </ProgressItem>
                  ))}
                </ProgressSection>
              </Section>

              {result.failed.length > 0 && (
                <Section>
                  <h3>Failed Updates ({result.failed.length})</h3>
                  <ProgressSection style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {result.failed.map((item, idx) => (
                      <ProgressItem key={idx} $type="error">
                        <FiAlertCircle size={16} />
                        <div>
                          <strong>{item.rollNumber} - {item.examName}</strong>
                          <small>{item.error}</small>
                        </div>
                      </ProgressItem>
                    ))}
                  </ProgressSection>
                </Section>
              )}

              <SubmitButton onClick={onClose} style={{ background: '#667eea' }}>
                Close
              </SubmitButton>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
}

export default BulkMarkUpload;
