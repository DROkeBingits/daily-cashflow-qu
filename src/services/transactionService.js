import { supabase } from '../supabase';

export const createTransaction = async (transactionData) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchTransactions = async () => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, date, type, category, amount, note, created_at')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateTransaction = async (transactionId, transactionData) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update(transactionData)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteTransaction = async (transactionId) => {
  try {
    const { error } = await supabase.from('transactions').delete().eq('id', transactionId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
