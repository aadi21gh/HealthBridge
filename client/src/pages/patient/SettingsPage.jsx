import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import PatientLayout from '../../layouts/PatientLayout.jsx';
import {
  Bell, Shield, Lock, Smartphone, CheckCircle2, Save,
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    smsConsent: true,
    emailConsent: true,
    emergencyAccess: true,
    labReportsReady: true,
  });

  const [consentDefaults, setConsentDefaults] = useState({
    defaultDuration: '30',
    autoRevokeOnInactive: true,
  });

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-surface-900">Account & Security Settings</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Configure consent notifications, privacy defaults, and account security.
          </p>
        </div>

        {saved && (
          <div className="alert-success flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <p className="text-xs font-medium">Settings updated successfully.</p>
          </div>
        )}

        <form onSubmit={handleSavePreferences} className="space-y-5">
          {/* Notification Preferences */}
          <div className="bg-white border border-surface-200 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-surface-900 text-sm border-b border-surface-100 pb-3">
              Consent & Clinical Notifications
            </h3>
            <p className="text-xs text-surface-500">
              Control alerts regarding your health records and practitioner requests.
            </p>

            <div className="space-y-2 pt-1">
              <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-50 cursor-pointer border border-surface-100 transition-colors">
                <input
                  type="checkbox"
                  checked={notifications.smsConsent}
                  onChange={(e) =>
                    setNotifications({ ...notifications, smsConsent: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 mt-0.5"
                />
                <div>
                  <p className="text-xs font-medium text-surface-900">SMS on Doctor Consent Request</p>
                  <p className="text-[11px] text-surface-500 mt-0.5">
                    Receive instant SMS message when a doctor requests access to your records.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-50 cursor-pointer border border-surface-100 transition-colors">
                <input
                  type="checkbox"
                  checked={notifications.emergencyAccess}
                  onChange={(e) =>
                    setNotifications({ ...notifications, emergencyAccess: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 mt-0.5"
                />
                <div>
                  <p className="text-xs font-medium text-surface-900">Break-Glass Emergency Access Alert</p>
                  <p className="text-[11px] text-surface-500 mt-0.5">
                    Immediately notify via SMS and Email whenever an ER physician exercises emergency access.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-50 cursor-pointer border border-surface-100 transition-colors">
                <input
                  type="checkbox"
                  checked={notifications.labReportsReady}
                  onChange={(e) =>
                    setNotifications({ ...notifications, labReportsReady: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 mt-0.5"
                />
                <div>
                  <p className="text-xs font-medium text-surface-900">Diagnostic Report Uploads</p>
                  <p className="text-[11px] text-surface-500 mt-0.5">
                    Notify when diagnostic labs or hospitals upload new records to your timeline.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Privacy & Consent Defaults */}
          <div className="bg-white border border-surface-200 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-surface-900 text-sm border-b border-surface-100 pb-3">
              Privacy & Consent Defaults
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Default Consent Duration</label>
                <select
                  value={consentDefaults.defaultDuration}
                  onChange={(e) =>
                    setConsentDefaults({ ...consentDefaults, defaultDuration: e.target.value })
                  }
                  className="input text-xs"
                >
                  <option value="7">7 Days</option>
                  <option value="15">15 Days</option>
                  <option value="30">30 Days (Standard Clinical)</option>
                  <option value="90">90 Days</option>
                  <option value="365">1 Year</option>
                </select>
                <p className="text-[11px] text-surface-400 mt-1">
                  Default validity period applied when approving practitioner access requests.
                </p>
              </div>

              <div className="form-group">
                <label className="label">Audit Log Retention</label>
                <input
                  type="text"
                  value="Indefinite (Immutable ABDM Ledger)"
                  disabled
                  className="input text-xs bg-surface-50 text-surface-500 cursor-not-allowed"
                />
                <p className="text-[11px] text-surface-400 mt-1">
                  All record access is cryptographic and permanently auditable.
                </p>
              </div>
            </div>
          </div>

          {/* Security & Authentication */}
          <div className="bg-white border border-surface-200 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-surface-900 text-sm border-b border-surface-100 pb-3">
              Authentication & Active Sessions
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-surface-50 border border-surface-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-700 font-semibold flex-shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-surface-900">Current Web Session</p>
                  <p className="text-[11px] text-surface-500">
                    Logged in as <span className="font-medium text-surface-700">{user?.email}</span>
                  </p>
                </div>
              </div>
              <span className="badge badge-success text-[10px]">Active Session</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn-primary btn-sm flex items-center gap-2">
              <Save className="w-3.5 h-3.5" />
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </PatientLayout>
  );
}

