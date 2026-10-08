
'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export type AccountResult = {
  error: string | null;
  success: string | null;
};

async function getCustomer() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Please sign in to continue.');
  }

  return { supabase, user };
}

function field(form: FormData, key: string) {
  return String(form.get(key) ?? '').trim();
}

export async function updateCustomerProfile(
  _previous: AccountResult,
  form: FormData
): Promise<AccountResult> {
  try {
    const { supabase, user } = await getCustomer();

    const fullName = field(form, 'full_name');
    const phone = field(form, 'phone');

    if (fullName.length < 2 || fullName.length > 100) {
      return {
        error: 'Name must contain 2–100 characters.',
        success: null,
      };
    }

    if (phone.length > 30) {
      return {
        error: 'Phone number is too long.',
        success: null,
      };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone })
      .eq('id', user.id);

    if (error) throw error;

    revalidatePath('/account');

    return {
      error: null,
      success: 'Your profile has been updated.',
    };
  } catch (error) {
    return {
      error: error instanceof Error
        ? error.message
        : 'Could not update your profile.',
      success: null,
    };
  }
}

export async function addCustomerAddress(
  _previous: AccountResult,
  form: FormData
): Promise<AccountResult> {
  try {
    const { supabase, user } = await getCustomer();

    const address = {
      user_id: user.id,
      label: field(form, 'label') || 'Home',
      recipient_name: field(form, 'recipient_name'),
      phone: field(form, 'phone'),
      address_line1: field(form, 'address_line1'),
      address_line2: field(form, 'address_line2') || null,
      city: field(form, 'city'),
      state: field(form, 'state'),
      country: 'Nigeria',
      postal_code: field(form, 'postal_code') || null,
      is_default: false,
    };

    if (
      !address.recipient_name ||
      !address.phone ||
      !address.address_line1 ||
      !address.city ||
      !address.state
    ) {
      return {
        error: 'Please complete all required address fields.',
        success: null,
      };
    }

    if (
      address.label.length > 40 ||
      address.recipient_name.length > 100 ||
      address.phone.length > 30 ||
      address.address_line1.length > 250 ||
      (address.address_line2?.length ?? 0) > 250 ||
      address.city.length > 100 ||
      address.state.length > 100 ||
      (address.postal_code?.length ?? 0) > 20
    ) {
      return {
        error: 'One or more address fields are too long.',
        success: null,
      };
    }

    const { error } = await supabase
      .from('customer_addresses')
      .insert(address);

    if (error) throw error;

    revalidatePath('/account');

    return {
      error: null,
      success: 'Delivery address saved.',
    };
  } catch (error) {
    return {
      error: error instanceof Error
        ? error.message
        : 'Could not save your address.',
      success: null,
    };
  }
}

export async function deleteCustomerAddress(
  addressId: string
): Promise<AccountResult> {
  try {
    const { supabase, user } = await getCustomer();

    if (!/^[0-9a-f-]{36}$/i.test(addressId)) {
      return { error: 'Invalid address.', success: null };
    }

    const { error } = await supabase
      .from('customer_addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', user.id);

    if (error) throw error;

    revalidatePath('/account');

    return { error: null, success: 'Address deleted.' };
  } catch (error) {
    return {
      error: error instanceof Error
        ? error.message
        : 'Could not delete address.',
      success: null,
    };
  }
}

export async function changeCustomerPassword(
  _previous: AccountResult,
  form: FormData
): Promise<AccountResult> {
  try {
    const { supabase, user } = await getCustomer();

    const currentPassword = field(form, 'current_password');
    const password = field(form, 'password');
    const confirm = field(form, 'confirm_password');

    if (password.length < 12) {
      return {
        error: 'New password must be at least 12 characters.',
        success: null,
      };
    }

    if (password !== confirm) {
      return {
        error: 'New passwords do not match.',
        success: null,
      };
    }

    if (!user.email) {
      return {
        error: 'No email is associated with this account.',
        success: null,
      };
    }

    const { error: verifyError } =
      await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

    if (verifyError) {
      return {
        error: 'Current password is incorrect.',
        success: null,
      };
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;

    return {
      error: null,
      success: 'Your password has been changed.',
    };
  } catch (error) {
    return {
      error: error instanceof Error
        ? error.message
        : 'Could not change password.',
      success: null,
    };
  }
}
