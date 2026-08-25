import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '../../services/healthbridge.js';
import { useAuth } from '../../context/AuthContext.jsx';
import PatientLayout from '../../layouts/PatientLayout.jsx';
import {
  User, Mail, Phone, Heart, MapPin, Check, AlertCircle, Loader2, Save,
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: profile } = useQuery({
    queryKey: ['patient-profile'],
    queryFn: patientService.getMyProfile,
  });

  const [form, setForm] = useState({
    dateOfBirth: '',
    gender: 'male',
    bloodGroup: 'O+',
    height: '',
    weight: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
    address: {
      line1: '',
      city: '',
      state: '',
      pincode: '',
    },
  });

  useEffect(() => {
    if (profile) {
      setForm({
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        gender: profile.gender || 'male',
        bloodGroup: profile.bloodGroup || 'O+',
        height: profile.height || '',
        weight: profile.weight || '',
        emergencyContact: {
          name: profile.emergencyContact?.name || '',
          relationship: profile.emergencyContact?.relationship || '',
          phone: profile.emergencyContact?.phone || '',
        },
        address: {
          line1: profile.address?.line1 || '',
          city: profile.address?.city || '',
          state: profile.address?.state || '',
          pincode: profile.address?.pincode || '',
        },
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data) => patientService.updateMyProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['patient-profile'], data);
      queryClient.invalidateQueries({ queryKey: ['patient-summary'] });
      setSuccessMsg('Your health profile has been successfully updated.');
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to update profile.');
      setSuccessMsg('');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  // BMI calculation
  const heightM = form.height ? form.height / 100 : null;
  const bmi = heightM && form.weight ? (form.weight / (heightM * heightM)).toFixed(1) : null;

  return (
    <PatientLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-surface-900">Personal Health Profile</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Manage your personal clinical vitals, emergency contacts, and residential details.
          </p>
        </div>

        {/* Identity Card */}
        <div className="bg-white border border-surface-200 rounded-xl p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-lg font-bold flex-shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg font-bold text-surface-900">{user?.firstName} {user?.lastName}</h2>
              <span className="badge-neutral badge text-xs">
                Verified Patient
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-1.5 text-xs text-surface-500">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-surface-400" />
                {user?.email}
              </span>
              {user?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-surface-400" />
                  {user.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="alert-success flex items-center gap-2.5">
            <Check className="w-4 h-4 flex-shrink-0" />
            <p className="text-xs font-medium">{successMsg}</p>
          </div>
        )}

        {errorMsg && (
          <div className="alert-danger flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-xs font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Medical Demographics */}
          <div className="bg-white border border-surface-200 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-surface-900 text-sm border-b border-surface-100 pb-3">
              Clinical Demographics & Physical Vitals
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="form-group">
                <label className="label">Date of Birth</label>
                <input
                  type="date"
                  className="input text-xs"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="label">Gender</label>
                <select
                  className="input text-xs capitalize"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label">Blood Group</label>
                <select
                  className="input text-xs font-semibold"
                  value={form.bloodGroup}
                  onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              <div className="form-group">
                <label className="label">Height (cm)</label>
                <input
                  type="number"
                  placeholder="e.g. 175"
                  className="input text-xs"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value ? Number(e.target.value) : '' })}
                />
              </div>

              <div className="form-group">
                <label className="label">Weight (kg)</label>
                <input
                  type="number"
                  placeholder="e.g. 70"
                  className="input text-xs"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value ? Number(e.target.value) : '' })}
                />
              </div>

              <div className="form-group">
                <label className="label">Calculated BMI</label>
                <div className="input text-xs bg-surface-50 flex items-center justify-between">
                  <span className="font-semibold text-surface-900">{bmi || '—'}</span>
                  {bmi && (
                    <span className="text-[11px] text-surface-500 font-medium">
                      {bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white border border-surface-200 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-surface-900 text-sm border-b border-surface-100 pb-3">
              Emergency Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="form-group">
                <label className="label">Contact Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Priya Kumar"
                  className="input text-xs"
                  value={form.emergencyContact.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      emergencyContact: { ...form.emergencyContact, name: e.target.value },
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="label">Relationship</label>
                <input
                  type="text"
                  placeholder="e.g. Spouse / Parent / Sibling"
                  className="input text-xs"
                  value={form.emergencyContact.relationship}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      emergencyContact: { ...form.emergencyContact, relationship: e.target.value },
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="label">Emergency Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +919876543210"
                  className="input text-xs"
                  value={form.emergencyContact.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      emergencyContact: { ...form.emergencyContact, phone: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white border border-surface-200 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-surface-900 text-sm border-b border-surface-100 pb-3">
              Residential Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="form-group sm:col-span-2">
                <label className="label">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 402, Green Valley Apartments"
                  className="input text-xs"
                  value={form.address.line1}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address: { ...form.address, line1: e.target.value },
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="label">City</label>
                <input
                  type="text"
                  placeholder="e.g. Hyderabad"
                  className="input text-xs"
                  value={form.address.city}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address: { ...form.address, city: e.target.value },
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="label">State</label>
                <input
                  type="text"
                  placeholder="e.g. Telangana"
                  className="input text-xs"
                  value={form.address.state}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address: { ...form.address, state: e.target.value },
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="label">PIN Code</label>
                <input
                  type="text"
                  placeholder="e.g. 500034"
                  className="input text-xs"
                  value={form.address.pincode}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address: { ...form.address, pincode: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="btn-primary btn-sm flex items-center gap-2"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {updateMutation.isPending ? 'Saving changes…' : 'Save Health Profile'}
            </button>
          </div>
        </form>
      </div>
    </PatientLayout>
  );
}

