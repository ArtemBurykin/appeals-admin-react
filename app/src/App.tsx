import { FC } from 'react';
import { Route, Routes, Navigate, Outlet } from 'react-router-dom';
import './App.css';
import Appeal from './components/Appeal/Appeal';
import AppealsList from './components/AppealsList/AppealsList';
import Login from './components/Login/Login';
import { useAuth } from './hooks/useAuth';

/**
 * The component to wrap other components to restrict access to them only for authenticated users.
 */
const Restricted = ({ children }: { children: JSX.Element }) => {
  const { authData } = useAuth();

  if (authData.token) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
};

const App: FC = () => {
  return (
    <div className="App">
      <h1>User appeals</h1>
      <Routes>
        <Route
          path="/appeals/:appealId"
          element={
            <Restricted>
              <Appeal />
            </Restricted>
          }
        />
        <Route
          path="/appeals"
          element={
            <Restricted>
              <AppealsList />
            </Restricted>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/appeals" />} />
        <Route path="*" element={<p>There is nothing here</p>} />
      </Routes>
      <Outlet />
    </div>
  );
};

export default App;
