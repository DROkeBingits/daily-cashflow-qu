import './styles.css';
import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
  updateTransaction,
} from './services/transactionService';
import { calculateBalance, calculateExpense, calculateIncome } from './utils/calculations';
import { filterTransactions } from './utils/filters';

const app = document.querySelector('#app');

const incomeCategories = ['Gaji', 'Bonus', 'Penjualan', 'Lainnya'];
const expenseCategories = ['Makan', 'Transportasi', 'Belanja', 'Tagihan', 'Lainnya'];

let transactions = [];
let appState = {
  isLoadingTransactions: true,
  transactionError: '',
  editingTransactionId: null,
  deletingTransactionId: null,
  isDeletingTransaction: false,
  filters: {
    date: '',
    month: '',
  },
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
};

const escapeHtml = (value) => {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
};

const sortTransactions = (transactions) => {
  return [...transactions].sort((firstTransaction, secondTransaction) => {
    const firstDate = new Date(`${firstTransaction.date}T00:00:00`).getTime();
    const secondDate = new Date(`${secondTransaction.date}T00:00:00`).getTime();

    if (secondDate !== firstDate) {
      return secondDate - firstDate;
    }

    return new Date(secondTransaction.created_at || 0).getTime() - new Date(firstTransaction.created_at || 0).getTime();
  });
};

const getEditingTransaction = () => {
  if (!appState.editingTransactionId) {
    return null;
  }

  return transactions.find((transactionData) => transactionData.id === appState.editingTransactionId) || null;
};

const getDeletingTransaction = () => {
  if (!appState.deletingTransactionId) {
    return null;
  }

  return transactions.find((transactionData) => transactionData.id === appState.deletingTransactionId) || null;
};

const getFilteredTransactions = () => {
  return filterTransactions(transactions, appState.filters);
};

const hasActiveFilters = () => {
  return Boolean(appState.filters.date || appState.filters.month);
};

const getStoredTheme = () => {
  return localStorage.getItem('daily-cashflow-theme') || 'system';
};

const getResolvedTheme = (theme) => {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return theme;
};

const applyTheme = (theme) => {
  const resolvedTheme = getResolvedTheme(theme);
  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
};

const getNextTheme = (theme) => {
  const themeStates = ['system', 'light', 'dark'];
  const currentIndex = themeStates.indexOf(theme);

  return themeStates[(currentIndex + 1) % themeStates.length];
};

const renderHeader = (theme) => {
  return `
    <header class="sticky top-0 z-20 -mx-4 border-b border-slate-200/70 bg-slate-50/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 dark:border-slate-800/80 dark:bg-slate-950/85">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <a href="#" class="flex min-w-0 items-center gap-3" aria-label="Daily Cashflow dashboard">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold text-white shadow-sm">
            DC
          </span>
          <span class="min-w-0">
            <span class="block truncate text-base font-semibold text-slate-950 dark:text-slate-50">
              Daily Cashflow
            </span>
            <span class="block truncate text-xs text-slate-500 dark:text-slate-400">
              Catatan cashflow harian
            </span>
          </span>
        </a>

        <button
          type="button"
          id="theme-toggle"
          class="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300 dark:focus:ring-offset-slate-950"
          aria-label="Ganti tema tampilan"
        >
          <span aria-hidden="true">${theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System'}</span>
          <span class="text-xs text-slate-400">Theme</span>
        </button>
      </div>
    </header>
  `;
};

const renderSummaryCards = (transactions) => {
  const totalIncome = calculateIncome(transactions);
  const totalExpense = calculateExpense(transactions);
  const currentBalance = calculateBalance(transactions);

  return `
    <section aria-labelledby="summary-title" class="grid gap-4 lg:grid-cols-3">
      <h2 id="summary-title" class="sr-only">Ringkasan cashflow</h2>

      <article class="lg:col-span-3 rounded-3xl border border-indigo-200 bg-indigo-600 p-6 text-white shadow-sm dark:border-indigo-500/30 dark:bg-indigo-500">
        <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-sm font-medium text-indigo-100">Current Balance</p>
            <p class="mt-3 text-3xl font-bold sm:text-4xl">${formatCurrency(currentBalance)}</p>
          </div>
          <p class="max-w-sm text-sm text-indigo-100">
            Ringkasan mengikuti transaksi yang sudah tersimpan di Supabase.
          </p>
        </div>
        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <div class="rounded-2xl bg-white/12 p-4 backdrop-blur">
            <p class="text-xs font-medium text-indigo-100">Income</p>
            <p class="mt-2 text-xl font-semibold">${formatCurrency(totalIncome)}</p>
          </div>
          <div class="rounded-2xl bg-white/12 p-4 backdrop-blur">
            <p class="text-xs font-medium text-indigo-100">Expense</p>
            <p class="mt-2 text-xl font-semibold">${formatCurrency(totalExpense)}</p>
          </div>
        </div>
      </article>

      ${renderMetricCard('Total Income', totalIncome, '+12%', 'text-emerald-600 dark:text-emerald-300')}
      ${renderMetricCard('Total Expense', totalExpense, '-4%', 'text-red-600 dark:text-red-300')}
      ${renderMetricCard('Net Balance', currentBalance, '+8%', 'text-indigo-600 dark:text-indigo-300')}
    </section>
  `;
};

const renderMetricCard = (label, amount, trend, trendClass) => {
  return `
    <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-sm text-slate-500 dark:text-slate-400">${label}</p>
          <p class="mt-3 text-2xl font-semibold text-slate-950 dark:text-slate-50">${formatCurrency(amount)}</p>
        </div>
        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold ${trendClass} dark:bg-slate-800">
          ${trend}
        </span>
      </div>
    </article>
  `;
};

const renderTransactionForm = () => {
  const editingTransaction = getEditingTransaction();
  const isEditing = Boolean(editingTransaction);

  return `
    <section id="transaction-form-section" aria-labelledby="form-title" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="form-title" class="text-2xl font-semibold text-slate-950 dark:text-slate-50">
            ${isEditing ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            ${
              isEditing
                ? 'Ubah data transaksi yang dipilih, lalu simpan perubahan.'
                : 'Isi transaksi baru, lalu simpan ke Supabase.'
            }
          </p>
        </div>
      </div>

      <form id="transaction-form" class="mt-6 grid gap-4 md:grid-cols-2" aria-label="${
        isEditing ? 'Form edit transaksi' : 'Form tambah transaksi'
      }" novalidate>
        <label class="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          Date
          <input
            name="date"
            type="date"
            required
            class="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
          />
          <span data-error-for="date" class="hidden text-xs font-medium text-red-600 dark:text-red-300"></span>
        </label>

        <label class="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          Type
          <select
            name="type"
            required
            class="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
          >
            <option value="">Pilih type</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <span data-error-for="type" class="hidden text-xs font-medium text-red-600 dark:text-red-300"></span>
        </label>

        <label class="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          Category
          <select
            name="category"
            required
            class="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
          >
            <option value="">Pilih type terlebih dahulu</option>
          </select>
          <span data-error-for="category" class="hidden text-xs font-medium text-red-600 dark:text-red-300"></span>
        </label>

        <label class="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          Amount
          <input
            name="amount"
            type="number"
            min="1"
            step="1"
            required
            placeholder="100000"
            class="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
          />
          <span data-error-for="amount" class="hidden text-xs font-medium text-red-600 dark:text-red-300"></span>
        </label>

        <label class="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2 dark:text-slate-200">
          Note
          <textarea
            name="note"
            rows="3"
            class="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
            placeholder="Catatan transaksi"
          ></textarea>
        </label>

        <div class="flex flex-col gap-3 md:col-span-2 sm:flex-row sm:justify-end">
          <button
            type="reset"
            class="min-h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-900"
          >
            ${isEditing ? 'Batal Edit' : 'Reset'}
          </button>
          <button
            type="submit"
            id="transaction-submit"
            class="min-h-11 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-offset-slate-900"
          >
            ${isEditing ? 'Update Transaksi' : 'Simpan Transaksi'}
          </button>
        </div>
      </form>
    </section>
  `;
};

const renderFilterBar = () => {
  return `
    <section aria-label="Filter transaksi" class="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-900">
      <input
        id="filter-date"
        type="date"
        value="${appState.filters.date}"
        class="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
        aria-label="Filter tanggal"
      />
      <input
        id="filter-month"
        type="month"
        value="${appState.filters.month}"
        class="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
        aria-label="Filter bulan"
      />
      <button
        type="button"
        id="reset-filters"
        class="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-900"
      >
        Reset Filter
      </button>
    </section>
  `;
};

const renderTransactionList = (transactions) => {
  return `
    <section aria-labelledby="transaction-list-title" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="transaction-list-title" class="text-2xl font-semibold text-slate-950 dark:text-slate-50">
            Riwayat Transaksi
          </h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Transaksi terbaru ditampilkan paling atas.
          </p>
        </div>
      </div>

      ${renderTransactionListContent(transactions)}
    </section>
  `;
};

const renderTransactionListContent = (transactions) => {
  if (appState.isLoadingTransactions) {
    return renderTransactionLoadingState();
  }

  if (appState.transactionError) {
    return renderTransactionErrorState();
  }

  if (transactions.length === 0) {
    return renderTransactionEmptyState();
  }

  return `
    <div class="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <div class="hidden grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid dark:bg-slate-950 dark:text-slate-400">
        <span>Date</span>
        <span>Category</span>
        <span>Type</span>
        <span class="text-right">Amount</span>
        <span class="text-right">Action</span>
      </div>
      <div class="divide-y divide-slate-200 dark:divide-slate-800">
        ${transactions.map(renderTransactionItem).join('')}
      </div>
    </div>
  `;
};

const renderTransactionLoadingState = () => {
  return `
    <div class="mt-5 grid gap-3" aria-label="Memuat transaksi">
      ${Array.from({ length: 4 })
        .map(
          () => `
            <div class="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div class="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800"></div>
              <div class="mt-3 h-3 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800"></div>
              <div class="mt-4 h-10 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"></div>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
};

const renderTransactionEmptyState = () => {
  return `
    <div class="mt-5 rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center dark:border-slate-700">
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
        +
      </div>
      <h3 class="mt-4 text-xl font-semibold text-slate-950 dark:text-slate-50">
        ${hasActiveFilters() ? 'Tidak ada transaksi yang cocok' : 'Belum ada transaksi'}
      </h3>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        ${hasActiveFilters() ? 'Ubah atau reset filter untuk melihat data lain' : 'Tambahkan transaksi pertama Anda'}
      </p>
    </div>
  `;
};

const renderTransactionErrorState = () => {
  return `
    <div class="mt-5 rounded-2xl border border-red-200 bg-red-50 px-6 py-6 dark:border-red-400/30 dark:bg-red-400/10">
      <h3 class="text-xl font-semibold text-red-700 dark:text-red-200">Terjadi kesalahan saat memuat data</h3>
      <p class="mt-2 text-sm text-red-600 dark:text-red-300">${escapeHtml(appState.transactionError)}</p>
      <button
        type="button"
        id="retry-transactions"
        class="mt-4 min-h-11 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-500 dark:hover:bg-red-400 dark:focus:ring-offset-slate-900"
      >
        Coba Lagi
      </button>
    </div>
  `;
};

const renderTransactionItem = (transactionData) => {
  const isIncome = transactionData.type === 'income';
  const amountClass = isIncome ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-600 dark:text-red-300';
  const typeLabel = isIncome ? 'Income' : 'Expense';
  const typeClass = isIncome
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20'
    : 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/20';
  const amountPrefix = isIncome ? '+' : '-';
  const category = escapeHtml(transactionData.category);
  const note = escapeHtml(transactionData.note || '-');

  return `
    <article class="grid gap-3 px-4 py-4 md:grid-cols-[1fr_1fr_1fr_1fr_auto] md:items-center md:gap-4">
      <div>
        <p class="text-sm font-semibold text-slate-900 dark:text-slate-50">${formatDate(transactionData.date)}</p>
        <p class="mt-1 text-xs text-slate-500 md:hidden dark:text-slate-400">${note}</p>
      </div>
      <div>
        <p class="text-sm font-medium text-slate-900 dark:text-slate-50">${category}</p>
        <p class="mt-1 hidden text-xs text-slate-500 md:block dark:text-slate-400">${note}</p>
      </div>
      <div>
        <span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${typeClass}">
          ${typeLabel}
        </span>
      </div>
      <p class="text-sm font-semibold md:text-right ${amountClass}">
        ${amountPrefix}${formatCurrency(transactionData.amount)}
      </p>
      <div class="flex gap-2 md:justify-end">
        <button
          type="button"
          data-edit-id="${transactionData.id}"
          class="min-h-11 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
          aria-label="Edit transaksi ${category}"
        >
          Edit
        </button>
        <button
          type="button"
          data-delete-id="${transactionData.id}"
          class="min-h-11 rounded-xl border border-red-200 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-red-400/30 dark:text-red-300 dark:hover:bg-red-400/10"
          aria-label="Hapus transaksi ${category}"
        >
          Hapus
        </button>
      </div>
    </article>
  `;
};

const renderQuickAddButton = () => {
  return `
    <button
      type="button"
      class="fixed bottom-6 right-6 z-30 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-semibold text-white shadow-lg transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-offset-slate-950"
      aria-label="Tambah transaksi cepat"
    >
      +
    </button>
  `;
};

const renderToastContainer = () => {
  return '<div id="toast-container" class="fixed right-4 top-4 z-40 grid w-[min(24rem,calc(100vw-2rem))] gap-3" aria-live="polite" aria-atomic="true"></div>';
};

const renderDeleteConfirmationModal = () => {
  const deletingTransaction = getDeletingTransaction();

  if (!deletingTransaction) {
    return '';
  }

  const category = escapeHtml(deletingTransaction.category);
  const amount = formatCurrency(Number(deletingTransaction.amount));

  return `
    <div
      class="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <section class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-300">
              Konfirmasi Hapus
            </p>
            <h2 id="delete-modal-title" class="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
              Hapus transaksi ini?
            </h2>
          </div>
          <button
            type="button"
            id="delete-modal-close"
            class="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Tutup dialog hapus"
          >
            x
          </button>
        </div>

        <p class="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Transaksi <strong>${category}</strong> senilai <strong>${amount}</strong> akan dihapus permanen dari Supabase.
        </p>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            id="cancel-delete"
            class="min-h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-900"
          >
            Batal
          </button>
          <button
            type="button"
            id="confirm-delete"
            class="min-h-11 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-red-500 dark:hover:bg-red-400 dark:focus:ring-offset-slate-900"
            ${appState.isDeletingTransaction ? 'disabled' : ''}
          >
            ${appState.isDeletingTransaction ? 'Menghapus...' : 'Hapus Transaksi'}
          </button>
        </div>
      </section>
    </div>
  `;
};

const showToast = (message, type = 'success') => {
  const toastContainer = document.querySelector('#toast-container');
  const toneClass =
    type === 'error'
      ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200';
  const toast = document.createElement('div');

  toast.className = `rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm transition ${toneClass}`;
  toast.textContent = message;
  toastContainer.append(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 3000);
};

const setFieldError = (form, fieldName, message) => {
  const field = form.elements[fieldName];
  const errorElement = form.querySelector(`[data-error-for="${fieldName}"]`);

  if (!errorElement || !field) {
    return;
  }

  errorElement.textContent = message;
  errorElement.classList.toggle('hidden', !message);
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
};

const clearFormErrors = (form) => {
  ['date', 'type', 'category', 'amount'].forEach((fieldName) => {
    setFieldError(form, fieldName, '');
  });
};

const validateTransactionForm = (form) => {
  const formData = new FormData(form);
  const transactionData = {
    date: String(formData.get('date') || '').trim(),
    type: String(formData.get('type') || '').trim(),
    category: String(formData.get('category') || '').trim(),
    amount: Number(formData.get('amount')),
    note: String(formData.get('note') || '').trim() || null,
  };
  const errors = {};

  if (!transactionData.date) {
    errors.date = 'Date wajib diisi.';
  }

  if (!transactionData.type) {
    errors.type = 'Type wajib dipilih.';
  }

  if (!transactionData.category) {
    errors.category = 'Category wajib dipilih.';
  }

  if (!Number.isFinite(transactionData.amount) || transactionData.amount <= 0) {
    errors.amount = 'Amount harus lebih dari 0.';
  }

  clearFormErrors(form);
  Object.entries(errors).forEach(([fieldName, message]) => {
    setFieldError(form, fieldName, message);
  });

  return {
    transactionData,
    isValid: Object.keys(errors).length === 0,
  };
};

const renderCategoryOptions = (type, selectedCategory = '') => {
  const categories = type === 'income' ? incomeCategories : type === 'expense' ? expenseCategories : [];
  const defaultLabel = type ? 'Pilih category' : 'Pilih type terlebih dahulu';

  return `
    <option value="">${defaultLabel}</option>
    ${categories
      .map((category) => `<option value="${category}" ${category === selectedCategory ? 'selected' : ''}>${category}</option>`)
      .join('')}
  `;
};

const setSubmitLoading = (button, isLoading) => {
  button.disabled = isLoading;
  button.textContent = isLoading
    ? appState.editingTransactionId
      ? 'Mengupdate...'
      : 'Menyimpan...'
    : appState.editingTransactionId
      ? 'Update Transaksi'
      : 'Simpan Transaksi';
  button.classList.toggle('opacity-70', isLoading);
  button.classList.toggle('cursor-not-allowed', isLoading);
};

const fillTransactionForm = (form, transactionData) => {
  if (!transactionData) {
    form.elements.date.valueAsDate = new Date();
    form.elements.type.value = '';
    form.elements.category.innerHTML = renderCategoryOptions('');
    form.elements.amount.value = '';
    form.elements.note.value = '';
    return;
  }

  form.elements.date.value = transactionData.date;
  form.elements.type.value = transactionData.type;
  form.elements.category.innerHTML = renderCategoryOptions(transactionData.type, transactionData.category);
  form.elements.amount.value = Number(transactionData.amount);
  form.elements.note.value = transactionData.note || '';
};

const setupTransactionForm = () => {
  const form = document.querySelector('#transaction-form');
  const editingTransaction = getEditingTransaction();
  const typeInput = form.elements.type;
  const categoryInput = form.elements.category;
  const dateInput = form.elements.date;
  const submitButton = document.querySelector('#transaction-submit');

  fillTransactionForm(form, editingTransaction);

  typeInput.addEventListener('change', () => {
    categoryInput.innerHTML = renderCategoryOptions(typeInput.value);
    setFieldError(form, 'type', '');
    setFieldError(form, 'category', '');
  });

  ['date', 'category', 'amount'].forEach((fieldName) => {
    form.elements[fieldName].addEventListener('input', () => {
      setFieldError(form, fieldName, '');
    });
  });

  form.addEventListener('reset', () => {
    window.setTimeout(() => {
      appState = {
        ...appState,
        editingTransactionId: null,
      };
      clearFormErrors(form);
      renderApp();
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const { transactionData, isValid } = validateTransactionForm(form);

    if (!isValid) {
      showToast('Periksa kembali data transaksi.', 'error');
      return;
    }

    setSubmitLoading(submitButton, true);

    try {
      if (appState.editingTransactionId) {
        const updatedTransaction = await updateTransaction(appState.editingTransactionId, transactionData);
        transactions = sortTransactions(
          transactions.map((currentTransaction) =>
            currentTransaction.id === updatedTransaction.id ? updatedTransaction : currentTransaction,
          ),
        );
        appState = {
          ...appState,
          editingTransactionId: null,
        };
        renderApp();
        showToast('Transaksi berhasil diupdate');
        return;
      }

      const createdTransaction = await createTransaction(transactionData);
      transactions = sortTransactions([createdTransaction, ...transactions]);
      renderApp();
      showToast('Transaksi berhasil disimpan');
    } catch (error) {
      showToast('Gagal menyimpan transaksi', 'error');
    } finally {
      setSubmitLoading(submitButton, false);
    }
  });
};

const loadTransactions = async () => {
  appState = {
    ...appState,
    isLoadingTransactions: true,
    transactionError: '',
  };
  renderApp();

  try {
    const fetchedTransactions = await fetchTransactions();
    transactions = sortTransactions(fetchedTransactions || []);
    appState = {
      ...appState,
      isLoadingTransactions: false,
      transactionError: '',
      editingTransactionId: transactions.some((transactionData) => transactionData.id === appState.editingTransactionId)
        ? appState.editingTransactionId
        : null,
    };
  } catch (error) {
    appState = {
      ...appState,
      isLoadingTransactions: false,
      transactionError: error.message || 'Gagal mengambil data transaksi.',
    };
  }

  renderApp();
};

const setupRetryButton = () => {
  const retryButton = document.querySelector('#retry-transactions');

  if (!retryButton) {
    return;
  }

  retryButton.addEventListener('click', () => {
    loadTransactions();
  });
};

const setupFilterControls = () => {
  const filterDateInput = document.querySelector('#filter-date');
  const filterMonthInput = document.querySelector('#filter-month');
  const resetFiltersButton = document.querySelector('#reset-filters');

  filterDateInput.addEventListener('input', () => {
    appState = {
      ...appState,
      filters: {
        ...appState.filters,
        date: filterDateInput.value,
      },
    };
    renderApp();
  });

  filterMonthInput.addEventListener('input', () => {
    appState = {
      ...appState,
      filters: {
        ...appState.filters,
        month: filterMonthInput.value,
      },
    };
    renderApp();
  });

  resetFiltersButton.addEventListener('click', () => {
    appState = {
      ...appState,
      filters: {
        date: '',
        month: '',
      },
    };
    renderApp();
  });
};

const setupEditButtons = () => {
  const editButtons = document.querySelectorAll('[data-edit-id]');

  editButtons.forEach((editButton) => {
    editButton.addEventListener('click', () => {
      appState = {
        ...appState,
        editingTransactionId: editButton.dataset.editId,
      };
      renderApp();
      document.querySelector('#transaction-form-section').scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  });
};

const closeDeleteModal = () => {
  appState = {
    ...appState,
    deletingTransactionId: null,
    isDeletingTransaction: false,
  };
  renderApp();
};

const setupDeleteButtons = () => {
  const deleteButtons = document.querySelectorAll('[data-delete-id]');

  deleteButtons.forEach((deleteButton) => {
    deleteButton.addEventListener('click', () => {
      appState = {
        ...appState,
        deletingTransactionId: deleteButton.dataset.deleteId,
      };
      renderApp();
    });
  });
};

const setupDeleteConfirmationModal = () => {
  const deletingTransaction = getDeletingTransaction();

  if (!deletingTransaction) {
    return;
  }

  document.querySelector('#delete-modal-close').addEventListener('click', closeDeleteModal);
  document.querySelector('#cancel-delete').addEventListener('click', closeDeleteModal);

  document.querySelector('#confirm-delete').addEventListener('click', async () => {
    appState = {
      ...appState,
      isDeletingTransaction: true,
    };
    renderApp();

    try {
      await deleteTransaction(deletingTransaction.id);
      transactions = transactions.filter((transactionData) => transactionData.id !== deletingTransaction.id);
      appState = {
        ...appState,
        deletingTransactionId: null,
        editingTransactionId:
          appState.editingTransactionId === deletingTransaction.id ? null : appState.editingTransactionId,
        isDeletingTransaction: false,
      };
      renderApp();
      showToast('Transaksi berhasil dihapus');
    } catch (error) {
      appState = {
        ...appState,
        isDeletingTransaction: false,
      };
      renderApp();
      showToast('Gagal menghapus transaksi', 'error');
    }
  });
};

const setupKeyboardEvents = () => {
  if (!appState.deletingTransactionId || appState.isDeletingTransaction) {
    return;
  }

  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape') {
        closeDeleteModal();
      }
    },
    { once: true },
  );
};

const renderApp = () => {
  const theme = getStoredTheme();
  const filteredTransactions = getFilteredTransactions();

  applyTheme(theme);

  app.innerHTML = `
    ${renderHeader(theme)}
    <main class="min-h-screen bg-slate-50 px-4 pb-28 pt-6 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div class="mx-auto grid max-w-6xl gap-6">
        ${renderSummaryCards(filteredTransactions)}

        <div class="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          ${renderTransactionForm()}
          <div class="grid content-start gap-6">
            ${renderFilterBar()}
            ${renderTransactionList(filteredTransactions)}
          </div>
        </div>
      </div>
    </main>
    ${renderQuickAddButton()}
    ${renderToastContainer()}
    ${renderDeleteConfirmationModal()}
  `;

  document.querySelector('#theme-toggle').addEventListener('click', () => {
    const nextTheme = getNextTheme(getStoredTheme());
    localStorage.setItem('daily-cashflow-theme', nextTheme);
    renderApp();
  });

  setupTransactionForm();
  setupRetryButton();
  setupFilterControls();
  setupEditButtons();
  setupDeleteButtons();
  setupDeleteConfirmationModal();
  setupKeyboardEvents();
};

renderApp();
loadTransactions();
