// src/components/ExamTable.jsx
import React, { useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react';
import StatusBadge from './StatusBadge';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const TableContainer = styled.div`
  animation: ${fadeIn} 0.3s ease;
`;

const SearchBox = styled.div`
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;

  input {
    flex: 1;
    padding: 10px 14px 10px 36px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }

  svg {
    position: absolute;
    left: 10px;
    color: #9ca3af;
    pointer-events: none;
  }
`;

const TableWrapper = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  tbody tr {
    border-bottom: 1px solid #e5e7eb;
    transition: all 0.2s ease;

    &:hover {
      background: #f9fafb;
    }

    &:last-child {
      border-bottom: none;
    }
  }
`;

const TableHeader = styled.th`
  padding: 14px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  user-select: none;
  cursor: pointer;
  transition: all 0.2s ease;

  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    width: 16px;
    height: 16px;
    opacity: 0.6;
  }
`;

const TableCell = styled.td`
  padding: 14px 16px;
  color: #374151;
  font-size: 0.95rem;

  &.action {
    text-align: center;
  }
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;

  svg {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
    opacity: 0.4;
  }

  h3 {
    font-size: 1.1rem;
    color: #6b7280;
    margin-bottom: 8px;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  background: #fafafa;
`;

const PaginationButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  font-weight: 500;

  &:hover:not(:disabled) {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const getSortIcon = (column, sortConfig) => {
  if (sortConfig?.key !== column) {
    return <ChevronsUpDown size={16} />;
  }
  return sortConfig.direction === 'asc' ? 
    <ChevronUp size={16} /> : 
    <ChevronDown size={16} />;
};

const ExamTable = ({ 
  data = [], 
  columns = [], 
  onRowClick,
  onAction,
  searchableFields = [],
  itemsPerPage = 10,
  showPagination = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter(item =>
      searchableFields.some(field => {
        const value = String(item[field] || '').toLowerCase();
        return value.includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, searchableFields]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData;

    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage, showPagination]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  if (data.length === 0) {
    return (
      <EmptyState>
        <h3>No data available</h3>
        <p>Try adjusting your filters or add new items</p>
      </EmptyState>
    );
  }

  return (
    <TableContainer>
      {searchableFields.length > 0 && (
        <SearchBox>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </SearchBox>
      )}

      <TableWrapper>
        <Table>
          <thead>
            <tr>
              {columns.map(column => (
                <TableHeader
                  key={column.key}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  style={{ cursor: column.sortable !== false ? 'pointer' : 'default' }}
                >
                  {column.label}
                  {column.sortable !== false && getSortIcon(column.key, sortConfig)}
                </TableHeader>
              ))}
              {onAction && <TableHeader>Action</TableHeader>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick && onRowClick(row)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map(column => (
                  <TableCell key={column.key}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </TableCell>
                ))}
                {onAction && (
                  <TableCell className="action">
                    {column.action && (
                      <ActionButton onClick={() => onAction(row)}>
                        {column.actionLabel || 'Action'}
                      </ActionButton>
                    )}
                  </TableCell>
                )}
              </tr>
            ))}
          </tbody>
        </Table>

        {showPagination && totalPages > 1 && (
          <PaginationContainer>
            <PaginationButton
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </PaginationButton>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                const diff = Math.abs(page - currentPage);
                return diff === 0 || diff === 1 || page === 1 || page === totalPages;
              })
              .map((page, idx, arr) => (
                <React.Fragment key={page}>
                  {idx > 0 && arr[idx - 1] !== page - 1 && (
                    <span style={{ color: '#9ca3af' }}>...</span>
                  )}
                  <PaginationButton
                    onClick={() => setCurrentPage(page)}
                    style={currentPage === page ? {
                      background: '#667eea',
                      color: 'white',
                      borderColor: '#667eea',
                    } : {}}
                  >
                    {page}
                  </PaginationButton>
                </React.Fragment>
              ))}

            <PaginationButton
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </PaginationButton>
          </PaginationContainer>
        )}
      </TableWrapper>
    </TableContainer>
  );
};

export default ExamTable;
