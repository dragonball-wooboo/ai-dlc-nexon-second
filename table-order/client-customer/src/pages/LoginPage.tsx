import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const [storeId, setStoreId] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(storeId, Number(tableNumber), password);
    setLoading(false);

    if (success) {
      navigate('/menu');
    } else {
      setError('로그인에 실패했습니다. 정보를 확인해주세요.');
    }
  };

  return (
    <div className="login-page" data-testid="login-page">
      <h1>테이블 설정</h1>
      <form onSubmit={handleSubmit} data-testid="login-form">
        <div className="form-group">
          <label htmlFor="storeId">매장 식별자</label>
          <input
            id="storeId"
            type="text"
            value={storeId}
            onChange={e => setStoreId(e.target.value)}
            required
            data-testid="login-store-id"
          />
        </div>
        <div className="form-group">
          <label htmlFor="tableNumber">테이블 번호</label>
          <input
            id="tableNumber"
            type="number"
            value={tableNumber}
            onChange={e => setTableNumber(e.target.value)}
            required
            data-testid="login-table-number"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            data-testid="login-password"
          />
        </div>
        {error && <p className="error-message" data-testid="login-error">{error}</p>}
        <button type="submit" disabled={loading} data-testid="login-submit-btn">
          {loading ? '로그인 중...' : '설정 완료'}
        </button>
      </form>
    </div>
  );
}
