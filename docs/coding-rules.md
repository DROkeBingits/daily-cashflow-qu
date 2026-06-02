# Coding Rules

## General Rules

* Gunakan JavaScript ES6+
* Gunakan async/await
* Hindari callback nesting
* Gunakan const terlebih dahulu
* Gunakan let jika perlu

---

## Naming Convention

Functions:

```javascript
createTransaction()
fetchTransactions()
updateTransaction()
deleteTransaction()
```

Variables:

```javascript
transactionData
totalIncome
totalExpense
currentBalance
```

---

## Folder Structure

```text
src/
├── main.js
├── supabase.js
├── services/
├── components/
└── utils/
```

---

## Function Rules

Satu fungsi satu tanggung jawab.

Contoh:

```javascript
calculateIncome()
calculateExpense()
calculateBalance()
```

Jangan membuat:

```javascript
calculateEverything()
```

---

## Validation Rules

Sebelum submit:

* Date wajib
* Type wajib
* Category wajib
* Amount > 0

---

## Error Handling

Gunakan:

```javascript
try {
} catch (error) {
  console.error(error);
}
```

Pada semua operasi Supabase.

---

## UI Rules

* Gunakan Tailwind Utility Classes
* Hindari inline style
* Gunakan semantic HTML
* Gunakan button type yang sesuai

---

## Performance Rules

* Fetch data hanya saat diperlukan
* Hindari render berulang
* Pisahkan logic dan UI

---

## Deployment Rules

Sebelum deploy:

* Tidak ada console error
* Tidak ada hardcoded key
* Gunakan environment variables
* Test CRUD terlebih dahulu

---

## Golden Rule

Prioritaskan aplikasi yang berjalan dengan baik dibanding aplikasi yang memiliki banyak fitur tetapi tidak stabil.
