import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const [storeId, setStoreId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!storeId.trim() || !username.trim() || !password) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const success = await login(storeId.trim(), username.trim(), password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('로그인에 실패했습니다. 정보를 확인해주세요.');
      }
    } catch {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__card">
        <h1 className="login-page__title">테이블오더 관리자</h1>

        <form className="login-page__form" onSubmit={handleSubmit}>
          <div className="login-page__field">
            <label htmlFor="store-id">매장 ID</label>
            <input
              id="store-id"
              type="text"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              placeholder="매장 ID를 입력하세요"
              autoComplete="username"
            />
          </div>

          <div className="login-page__field">
            <label htmlFor="username">사용자명</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="사용자명을 입력하세요"
              autoComplete="username"
            />
          </div>

          <div className="login-page__field">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="login-page__error" role="alert">{error}</p>}

          <button
            type="submit"
            className="btn btn--primary login-page__submit"
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
