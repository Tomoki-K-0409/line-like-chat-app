'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    if (!username) {
      setError('ユーザー名を入力してください。');
      return;
    }

    try {
      // Attempt to register first
      const registerResponse = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (registerResponse.ok) {
        console.log('ユーザー登録成功:', username);
      } else if (registerResponse.status === 400) {
        // User already exists, proceed to login
        console.log('ユーザーは既に登録されています:', username);
      } else {
        const errorData = await registerResponse.json();
        setError(errorData.detail || '登録に失敗しました。');
        return;
      }

      // Then attempt to login
      const loginResponse = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (loginResponse.ok) {
        console.log('ログイン成功:', username);
        localStorage.setItem('username', username);
        router.push('/chat');
      } else {
        const errorData = await loginResponse.json();
        setError(errorData.detail || 'ログインに失敗しました。');
      }
    } catch (err) {
      console.error('API呼び出しエラー:', err);
      setError('サーバーに接続できませんでした。');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 rounded-lg shadow-md bg-white w-96">
        <h1 className="text-2xl font-bold text-center mb-6">LINE Chat App</h1>
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
            ユーザー名
          </label>
          <input
            type="text"
            id="username"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ユーザー名を入力"
          />
        </div>
        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
        <button
          onClick={handleLogin}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
        >
          チャットルームに入室
        </button>
      </div>
    </div>
  );
}