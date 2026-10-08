
'use client';

import { useActionState, useState } from 'react';
import {
  updateCustomerProfile,
  addCustomerAddress,
  deleteCustomerAddress,
  changeCustomerPassword,
  type AccountResult,
} from './actions';

type Address = {
  id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string | null;
  is_default: boolean;
};

type Props = {
  profile: {
    full_name: string | null;
    email: string;
    phone: string | null;
  };
  addresses: Address[];
};

const initialState: AccountResult = {
  error: null,
  success: null,
};

const inputClass =
  'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#0A2A6A]';

const buttonClass =
  'rounded-xl bg-[#0A2A6A] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50';

function Feedback({ state }: { state: AccountResult }) {
  return (
    <>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-green-700">
          {state.success}
        </p>
      )}
    </>
  );
}

export default function AccountDashboard({
  profile,
  addresses,
}: Props) {
  const [profileState, profileAction, profilePending] =
    useActionState(updateCustomerProfile, initialState);

  const [addressState, addressAction, addressPending] =
    useActionState(addCustomerAddress, initialState);

  const [passwordState, passwordAction, passwordPending] =
    useActionState(changeCustomerPassword, initialState);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  async function removeAddress(id: string) {
    if (!window.confirm('Delete this delivery address?')) return;

    setDeletingId(id);
    setDeleteError('');

    try {
      const result = await deleteCustomerAddress(id);
      if (result.error) setDeleteError(result.error);
    } catch {
      setDeleteError('Unable to delete address.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-10">
      <section
        id="overview"
        className="rounded-2xl bg-[#0A2A6A] p-7 text-white"
      >
        <p className="text-sm text-blue-100">
          Oxcetera Customer Account
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Welcome, {profile.full_name || 'Customer'}
        </h1>

        <p className="mt-3 text-sm text-blue-100">
          Manage your profile, delivery details and account security.
        </p>

        <a
          href="/shop"
          className="mt-6 inline-block rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#0A2A6A]"
        >
          Continue Shopping
        </a>
      </section>

      <section
        id="profile"
        className="rounded-2xl border border-gray-200 bg-white p-6"
      >
        <h2 className="text-xl font-bold text-[#0A2A6A]">
          My Profile
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Update your personal information.
        </p>

        <form action={profileAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="full_name" className="mb-2 block text-sm font-medium">
              Full Name
            </label>
            <input
              id="full_name"
              name="full_name"
              defaultValue={profile.full_name ?? ''}
              required
              maxLength={100}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="profile_email" className="mb-2 block text-sm font-medium">
              Email Address
            </label>
            <input
              id="profile_email"
              type="email"
              value={profile.email}
              readOnly
              className={`${inputClass} bg-gray-100`}
            />
          </div>

          <div>
            <label htmlFor="profile_phone" className="mb-2 block text-sm font-medium">
              Phone Number
            </label>
            <input
              id="profile_phone"
              name="phone"
              type="tel"
              defaultValue={profile.phone ?? ''}
              maxLength={30}
              className={inputClass}
            />
          </div>

          <Feedback state={profileState} />

          <button disabled={profilePending} className={buttonClass}>
            {profilePending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </section>

      <section
        id="addresses"
        className="rounded-2xl border border-gray-200 bg-white p-6"
      >
        <h2 className="text-xl font-bold text-[#0A2A6A]">
          Delivery Addresses
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Save addresses for future purchases.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-[#0A2A6A]">
                  {address.label}
                </h3>

                {address.is_default && (
                  <span className="text-xs font-medium text-green-700">
                    Default
                  </span>
                )}
              </div>

              <p className="mt-3 text-sm font-medium">
                {address.recipient_name}
              </p>

              <p className="mt-1 text-sm text-gray-600">
                {address.address_line1}
                {address.address_line2 && `, ${address.address_line2}`}
                <br />
                {address.city}, {address.state}, Nigeria
                {address.postal_code && ` ${address.postal_code}`}
                <br />
                {address.phone}
              </p>

              <button
                type="button"
                disabled={deletingId === address.id}
                onClick={() => removeAddress(address.id)}
                className="mt-4 text-sm font-semibold text-[#D6252A] disabled:opacity-50"
              >
                {deletingId === address.id
                  ? 'Deleting...'
                  : 'Delete Address'}
              </button>
            </div>
          ))}
        </div>

        {addresses.length === 0 && (
          <p className="mt-5 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
            You haven't saved any delivery addresses yet.
          </p>
        )}

        {deleteError && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {deleteError}
          </p>
        )}

        <h3 className="mt-8 text-lg font-semibold">
          Add a Delivery Address
        </h3>

        <form action={addressAction} className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            name="label"
            placeholder="Label (Home, Office)"
            maxLength={40}
            className={inputClass}
          />
          <input
            name="recipient_name"
            placeholder="Recipient full name *"
            required
            maxLength={100}
            className={inputClass}
          />
          <input
            name="phone"
            type="tel"
            placeholder="Phone number *"
            required
            maxLength={30}
            className={inputClass}
          />
          <input
            name="address_line1"
            placeholder="Street address *"
            required
            maxLength={250}
            className={inputClass}
          />
          <input
            name="address_line2"
            placeholder="Apartment, suite, landmark"
            maxLength={250}
            className={inputClass}
          />
          <input
            name="city"
            placeholder="City *"
            required
            maxLength={100}
            className={inputClass}
          />
          <input
            name="state"
            placeholder="State *"
            required
            maxLength={100}
            className={inputClass}
          />
          <input
            name="postal_code"
            placeholder="Postal code (optional)"
            maxLength={20}
            className={inputClass}
          />

          <div className="md:col-span-2 space-y-3">
            <Feedback state={addressState} />

            <button disabled={addressPending} className={buttonClass}>
              {addressPending ? 'Saving...' : 'Add Address'}
            </button>
          </div>
        </form>
      </section>

      <section
        id="security"
        className="rounded-2xl border border-gray-200 bg-white p-6"
      >
        <h2 className="text-xl font-bold text-[#0A2A6A]">
          Account Security
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Change your password securely.
        </p>

        <form action={passwordAction} className="mt-6 max-w-lg space-y-4">
          <input
            name="current_password"
            type="password"
            placeholder="Current password"
            autoComplete="current-password"
            required
            className={inputClass}
          />
          <input
            name="password"
            type="password"
            placeholder="New password (12+ characters)"
            autoComplete="new-password"
            minLength={12}
            required
            className={inputClass}
          />
          <input
            name="confirm_password"
            type="password"
            placeholder="Confirm new password"
            autoComplete="new-password"
            minLength={12}
            required
            className={inputClass}
          />

          <Feedback state={passwordState} />

          <button disabled={passwordPending} className={buttonClass}>
            {passwordPending
              ? 'Updating...'
              : 'Change Password'}
          </button>
        </form>
      </section>
    </div>
  );
}
