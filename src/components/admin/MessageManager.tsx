'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { api, errorText, type Paginated } from './api';
import { Empty, Loading, Modal, PageHead, Pagination, Tabs, dateVN } from './ui';

type Message = { id: number; name: string; email: string; company: string; phone: string; message: string; isRead: boolean; createdAt: string };
type Subscriber = { id: number; email: string; createdAt: string };

const TABS = [
  { id: 'messages', label: '✉️ Contact messages' },
  { id: 'subscribers', label: '📬 Newsletter sign-ups' },
];

export default function MessageManager() {
  const router = useRouter();
  const [tab, setTab] = useState('messages');
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [subscribers, setSubscribers] = useState<Subscriber[] | null>(null);
  const [open, setOpen] = useState<Message | null>(null);
  const [error, setError] = useState('');

  const loadMessages = useCallback(() => {
    api
      .get<Paginated<Message>>(`messages?page=${page}&limit=20`)
      .then((response) => {
        setMessages(response.data);
        setPages(response.pagination.pages);
        setTotal(response.pagination.total);
      })
      .catch((failure) => setError(errorText(failure)));
  }, [page]);
  useEffect(loadMessages, [loadMessages]);

  const loadSubscribers = useCallback(() => {
    api
      .get<{ data: Subscriber[] }>('subscribers')
      .then((response) => setSubscribers(response.data))
      .catch((failure) => setError(errorText(failure)));
  }, []);
  useEffect(() => {
    if (tab === 'subscribers' && subscribers === null) loadSubscribers();
  }, [tab, subscribers, loadSubscribers]);

  const markRead = async (message: Message, isRead: boolean) => {
    if (message.isRead === isRead) return;
    try {
      await api.put(`messages/${message.id}`, { isRead });
      setMessages((current) => current?.map((item) => (item.id === message.id ? { ...item, isRead } : item)) ?? null);
      router.refresh(); // updates the unread badge in the sidebar
    } catch (failure) {
      window.alert(errorText(failure));
    }
  };

  const show = (message: Message) => {
    setOpen(message);
    markRead(message, true);
  };

  const removeMessage = async (message: Message) => {
    if (!window.confirm(`Delete the message from "${message.name}"?`)) return;
    try {
      await api.del(`messages/${message.id}`);
      setOpen(null);
      loadMessages();
      router.refresh();
    } catch (failure) {
      window.alert(errorText(failure));
    }
  };

  const removeSubscriber = async (subscriber: Subscriber) => {
    if (!window.confirm(`Delete ${subscriber.email} from the newsletter list?`)) return;
    try {
      await api.del(`subscribers/${subscriber.id}`);
      loadSubscribers();
    } catch (failure) {
      window.alert(errorText(failure));
    }
  };

  const copyEmails = async () => {
    if (!subscribers?.length) return;
    await navigator.clipboard.writeText(subscribers.map((item) => item.email).join('\n'));
    window.alert(`Copied ${subscribers.length} ${subscribers.length === 1 ? 'email' : 'emails'} to the clipboard.`);
  };

  return (
    <>
      <PageHead title="Messages" sub="Messages from the Contact form and newsletter sign-ups from the footer" />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {error && <div className="adm-error">{error}</div>}

      {tab === 'messages' && (
        <div className="adm-card adm-card--flush">
          {!messages && !error && <Loading />}
          {messages && messages.length === 0 && <Empty icon="✉️" text="No messages yet." />}
          {messages && messages.length > 0 && (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Date sent</th>
                    <th>Sender</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr key={message.id} className={message.isRead ? undefined : 'is-unread'}>
                      <td className="adm-muted" style={{ whiteSpace: 'nowrap' }}>
                        {dateVN(message.createdAt, true)}
                      </td>
                      <td className="adm-cell-title">
                        <strong>{message.name}</strong>
                        <small>{message.email}</small>
                        {message.company && <small>{message.company}</small>}
                      </td>
                      <td style={{ maxWidth: 420 }}>
                        <button type="button" className="adm-link adm-link--muted" style={{ textAlign: 'left', fontSize: 14, color: 'inherit' }} onClick={() => show(message)}>
                          {message.message.length > 110 ? `${message.message.slice(0, 110)}…` : message.message}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`adm-badge ${message.isRead ? 'adm-badge--gray' : 'adm-badge--primary'}`}
                          title="Click to change status"
                          onClick={() => markRead(message, !message.isRead)}
                        >
                          {message.isRead ? 'Read' : 'New'}
                        </button>
                      </td>
                      <td>
                        <div className="adm-acts">
                          <button type="button" className="adm-act adm-act--edit" onClick={() => show(message)}>
                            View
                          </button>
                          <button type="button" className="adm-act adm-act--del" onClick={() => removeMessage(message)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {messages && messages.length > 0 && <div className="adm-table-foot">{total} {total === 1 ? 'message' : 'messages'}</div>}
          <Pagination page={page} pages={pages} onChange={setPage} />
        </div>
      )}

      {tab === 'subscribers' && (
        <div className="adm-card adm-card--flush">
          <div className="adm-filters">
            <button type="button" className="adm-btn adm-btn--outline adm-btn--sm" disabled={!subscribers?.length} onClick={copyEmails}>
              📋 Copy all emails
            </button>
            <span className="adm-filters__count">{subscribers?.length ?? 0} {subscribers?.length === 1 ? 'email' : 'emails'}</span>
          </div>
          {!subscribers && !error && <Loading />}
          {subscribers && subscribers.length === 0 && <Empty icon="📬" text="No newsletter sign-ups yet." />}
          {subscribers && subscribers.length > 0 && (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Sign-up date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id}>
                      <td>{subscriber.email}</td>
                      <td className="adm-muted">{dateVN(subscriber.createdAt, true)}</td>
                      <td>
                        <button type="button" className="adm-act adm-act--del" onClick={() => removeSubscriber(subscriber)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {open && (
        <Modal title={`Message from ${open.name}`} onClose={() => setOpen(null)} wide>
          <div className="adm-grid" style={{ marginBottom: 16 }}>
            <div>
              <div className="adm-muted">Email</div>
              <a className="adm-link" style={{ fontSize: 14 }} href={`mailto:${open.email}`}>
                {open.email}
              </a>
            </div>
            <div>
              <div className="adm-muted">Date sent</div>
              {dateVN(open.createdAt, true)}
            </div>
            {open.company && (
              <div>
                <div className="adm-muted">Company</div>
                {open.company}
              </div>
            )}
            {open.phone && (
              <div>
                <div className="adm-muted">Phone</div>
                {open.phone}
              </div>
            )}
          </div>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{open.message}</p>
        </Modal>
      )}
    </>
  );
}
