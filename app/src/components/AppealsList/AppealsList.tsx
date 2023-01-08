import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AppealListItem } from './AppealListItem';
import './AppealsList.css';

/**
 * The component displays the list of appeals from the server.
 */
const AppealsList: FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appeals, setAppeals] = useState<AppealListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { authData } = useAuth();
  const navigate = useNavigate();

  /**
   * Fetch appeals from the server.
   */
  const fetchAppeals = async (token: string | null) => {
    setIsLoading(true);

    const headers = new Headers();
    headers.append('Authorization', `Bearer ${token}`);

    const response = await fetch('/api/appeals', { headers });

    if (!response.ok) {
      const errorData = (await response.json()) as { error: string };
      setError(errorData.error);
    } else {
      const data = (await response.json()) as AppealListItem[];
      setAppeals(data);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchAppeals(authData.token);
  }, [authData]);

  /**
   * Navigates to the appeal data component.
   */
  const goToItem = (id: string) => {
    navigate(`/appeals/${id}`);
  };

  return (
    <>
      {isLoading ? (
        <p>Loading...</p>
      ) : error === null ? (
        <table className="appeals-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Title</th>
            </tr>
          </thead>
          <tbody>
            {appeals.map((appeal) => (
              <tr key={appeal.id} onClick={() => goToItem(appeal.id)}>
                <td>{appeal.id}</td>
                <td>{appeal.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="alert alert-danger mt-4" role="alert" id="error-info">
          {error}
        </div>
      )}
    </>
  );
};

export default AppealsList;
