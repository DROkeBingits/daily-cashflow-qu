export const filterTransactionsByDate = (transactions, filterDate) => {
  if (!filterDate) {
    return transactions;
  }

  return transactions.filter((transactionData) => transactionData.date === filterDate);
};

export const filterTransactionsByMonth = (transactions, filterMonth) => {
  if (!filterMonth) {
    return transactions;
  }

  return transactions.filter((transactionData) => transactionData.date.startsWith(filterMonth));
};

export const filterTransactions = (transactions, filters) => {
  const dateFilteredTransactions = filterTransactionsByDate(transactions, filters.date);

  return filterTransactionsByMonth(dateFilteredTransactions, filters.month);
};
