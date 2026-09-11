import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';
import { 
  Copy, 
  Check, 
  Share2, 
  Mail, 
  UserPlus, 
  User, 
  Link as LinkIcon, 
  AlertCircle, 
  Send, 
  ExternalLink,
  Eye
} from 'lucide-react';

export function InviteModal({ isOpen, onClose }) {
  const { activeTrip, inviteMemberDirect } = useTrip();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('email'); // Default to email tab as requested
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Invite by email form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [isSentSuccess, setIsSentSuccess] = useState(false);
  const [sentRecipient, setSentRecipient] = useState(null);

  if (!activeTrip) return null;

  const code = activeTrip.invite_code || 'TRIP26';
  const inviteUrl = `${window.location.origin}${window.location.pathname}?join=${code}`;
  const senderName = currentUser?.name || 'Your friend';

  const emailSubject = `You're invited to join "${activeTrip.name}" on TripSplit!`;
  const emailBody = `Hi ${name.trim() || 'there'},

${senderName} has invited you to join the trip "${activeTrip.name}" (${activeTrip.destination}) on TripSplit.

Use this unique invite code to join:
👉 ${code}

Or join instantly with this link:
🔗 ${inviteUrl}

Once joined, you can add shared expenses, see who paid for what, and automatically calculate who owes whom!

See you on the trip,
The TripSplit Team`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      addToast({ type: 'success', message: `Copied invite code: ${code}` });
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      addToast({ type: 'error', message: 'Failed to copy code' });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      addToast({ type: 'success', message: 'Invite link copied to clipboard!' });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      addToast({ type: 'error', message: 'Failed to copy link' });
    }
  };

  const handleSendEmailInvite = async (e) => {
    e.preventDefault();
    setEmailError('');

    if (!name.trim()) {
      setEmailError('Please enter the friend’s name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    try {
      const res = await inviteMemberDirect({ name, email, sendEmail: true });
      if (!res.success) {
        setEmailError(res.message);
        return;
      }

      setSentRecipient({ name: name.trim(), email: email.trim() });
      setIsSentSuccess(true);
      addToast({
        type: 'success',
        message: `Invitation email recorded for ${email.trim()}!`,
      });
    } catch (err) {
      setEmailError(err.message || 'Failed to send invite');
    }
  };

  const handleOpenMailClient = () => {
    if (!email.trim()) {
      setEmailError('Please enter an email address first.');
      return;
    }
    const mailtoUrl = `mailto:${encodeURIComponent(email.trim())}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoUrl, '_blank');
  };

  const handleOpenGmail = () => {
    if (!email.trim()) {
      setEmailError('Please enter an email address first.');
      return;
    }
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email.trim())}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(gmailUrl, '_blank');
  };

  const handleResetForm = () => {
    setIsSentSuccess(false);
    setSentRecipient(null);
    setName('');
    setEmail('');
    setEmailError('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleResetForm();
        onClose();
      }}
      title="Invite Friends to Trip"
      subtitle={`Send email invitation to join ${activeTrip.name}`}
      maxWidth={500}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Switcher Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-app)',
          padding: 4,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('email'); setIsSentSuccess(false); }}
            className="btn btn-sm"
            style={{
              flex: 1,
              background: activeTab === 'email' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'email' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            <Mail size={14} />
            Send Email Invite
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('code'); setIsSentSuccess(false); }}
            className="btn btn-sm"
            style={{
              flex: 1,
              background: activeTab === 'code' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'code' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            <LinkIcon size={14} />
            Share Code & Link
          </button>
        </div>

        {activeTab === 'email' ? (
          <div>
            {isSentSuccess ? (
              /* Success State */
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
                border: '1px solid var(--color-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 4px 14px var(--color-primary-glow)',
                }}>
                  <Send size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    Invitation Email Sent!
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    We sent an invitation to <strong>{sentRecipient?.name}</strong> ({sentRecipient?.email}) with code <strong>{code}</strong>.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="btn btn-secondary btn-sm"
                  >
                    + Invite Another Friend
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-primary btn-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Email Invitation Form */
              <form onSubmit={handleSendEmailInvite} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {emailError && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-danger-bg)',
                    color: 'var(--color-danger)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <AlertCircle size={16} />
                    <span>{emailError}</span>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Friend's Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 14 }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya Chen"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: 38 }}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Friend's Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 14 }} />
                    <input
                      type="email"
                      required
                      placeholder="maya@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: 38 }}
                    />
                  </div>
                </div>

                {/* Email Preview Accordion */}
                <div style={{
                  background: 'var(--bg-app)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  padding: '12px 14px',
                }}>
                  <div
                    onClick={() => setShowPreview(!showPreview)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-dim)',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Eye size={14} />
                      Email Preview ({emailSubject})
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)' }}>
                      {showPreview ? 'Hide' : 'View'}
                    </span>
                  </div>

                  {showPreview && (
                    <div style={{
                      marginTop: 10,
                      paddingTop: 10,
                      borderTop: '1px solid var(--border-subtle)',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-line',
                      fontFamily: 'monospace',
                    }}>
                      {emailBody}
                    </div>
                  )}
                </div>

                {/* Direct Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px' }}>
                    <Send size={16} />
                    Send Email Invitation
                  </button>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={handleOpenGmail}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}
                    >
                      <ExternalLink size={13} />
                      Open in Gmail
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenMailClient}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}
                    >
                      <Mail size={13} />
                      Default Mail App
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Code and Link Sharing Tab */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Large Invite Code Box */}
            <div style={{
              background: 'var(--bg-app)',
              border: '1px dashed var(--color-primary)',
              borderRadius: 'var(--radius-xl)',
              padding: '22px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Unique Trip Invite Code
              </span>
              <div style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                letterSpacing: '0.18em',
                color: 'var(--color-primary)',
              }}>
                {code}
              </div>

              <button
                onClick={handleCopyCode}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 4, borderRadius: 'var(--radius-full)' }}
              >
                {copiedCode ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                <span>{copiedCode ? 'Code Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Direct Join Link */}
            <div>
              <label className="form-label" style={{ fontSize: '0.825rem' }}>
                Or Share Direct Join Link
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="form-input"
                  style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}
                />
                <button
                  onClick={handleCopyLink}
                  className="btn btn-primary"
                  style={{ flexShrink: 0 }}
                >
                  {copiedLink ? <Check size={16} /> : <Share2 size={16} />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div style={{
              background: 'var(--color-primary-light)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              color: 'var(--text-main)',
            }}>
              💡 When friends click this link or enter code <strong>{code}</strong>, they can sign in with their own account and join the trip!
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
