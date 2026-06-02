export const calculateIncome = (transactions) => {
  return transactions
    .filter((transactionData) => transactionData.type === 'income')
    .reduce((totalIncome, transactionData) => totalIncome + Number(transactionData.amount), 0);
};

export const calculateExpense = (transactions) => {
  return transactions
    .filter((transactionData) => transactionData.type === 'expense')
    .reduce((totalExpense, transactionData) => totalExpense + Number(transactionData.amount), 0);
};

export const calculateBalance = (transactions) => {
  return calculateIncome(transactions) - calculateExpense(transactions);
};
