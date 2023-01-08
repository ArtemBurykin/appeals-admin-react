import { ChangeEvent, FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Appeal.css';
import { AppealItem } from './AppealItem';
import { AppealMessage } from './AppealMessage';

/**
 * The component to display a single appeal.
 */
const Appeal: FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appeal, setAppeal] = useState<AppealItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<AppealMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [addMessageStatus, setAddMessageStatus] = useState<string>('');

  const { authData } = useAuth();
  const { appealId } = useParams<string>();

  /**
   * Gets the appeal data from the server.
   */
  const fetchAppeal = async (token: string | null, appealId: string) => {
    setIsLoading(true);

    const headers = new Headers();
    headers.append('Authorization', `Bearer ${token}`);

    const response = await fetch(`/api/appeals/${appealId}`, { headers });

    if (!response.ok) {
      const errorData = (await response.json()) as { error: string };
      setError(errorData.error);
    } else {
      const data = (await response.json()) as AppealItem;
      setAppeal(data);
      setMessages(data.messages);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchAppeal(authData.token, appealId as string);
  }, [authData]);

  /**
   * To update state when the message input value is changed.
   */
  const newMessageChanged = (e: ChangeEvent) => {
    const inputEl = e.target as HTMLInputElement;
    setNewMessage(inputEl.value);
  };

  /**
   * Sends the request to add a message on the server, adds the message to the messages list.
   */
  const addMessage = async () => {
    const body = { message: newMessage, isAdmin: true };

    const headers = new Headers();
    headers.append('Authorization', `Bearer ${authData.token}`);

    const response = await fetch(`/api/appeals/${appealId}/add-message`, {
      body: JSON.stringify(body),
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { error: string };
      setAddMessageStatus(errorData.error);
    } else {
      const currentMessages = [...messages];
      currentMessages.push({ text: newMessage, isAdmin: true });
      setMessages(currentMessages);
      setNewMessage('');
    }
  };

  return (
    <>
      {isLoading === true ? (
        <p>Loading...</p>
      ) : error === null ? (
        <div className="appeal" data-testid="Appeal">
          <h2 className="appeal__title" data-testid="title">
            Appeal #{appeal?.id}: {appeal?.title}
          </h2>
          <div className="appeal__messages">
            <h3 className="appeal__messages-title">Messages:</h3>
            {messages.map((message, index) => (
              <div
                className="appeal__message"
                key={index}
                data-testid="message">
                {message.isAdmin && (
                  <div className="appeal__message-author">By admin</div>
                )}
                {message.text}
              </div>
            ))}
          </div>
          <div className="appeal__add-message-form">
            <textarea
              className="appeal__message-input"
              value={newMessage}
              onChange={newMessageChanged}
              data-testid="messageInput"></textarea>
            <div
              className="appeal__add-message-btn"
              data-testid="send-btn"
              onClick={addMessage}>
              Add message
            </div>
            <div
              className="appeal__add-message-status"
              data-testid="add-message-status">
              {addMessageStatus}
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-danger mt-4" role="alert" id="error-info">
          {error}
        </div>
      )}
    </>
  );
};

export default Appeal;
