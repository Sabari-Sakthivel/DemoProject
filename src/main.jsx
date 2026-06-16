import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDownUp,
  CalendarDays,
  CircleDollarSign,
  Coffee,
  CreditCard,
  Filter,
  Home,
  PiggyBank,
  ReceiptText,
  Search,
  ShoppingBag,
  Utensils,
  WalletCards
} from 'lucide-react';
import './styles.css';

const demoTransactions = [
  { id: 1, date: '2026-06-01', merchant: 'Fresh Basket', category: 'Groceries', amount: 86.45 },
  { id: 2, date: '2026-06-02', merchant: 'Metro Tap', category: 'Transport', amount: 24.0 },
  { id: 3, date: '2026-06-03', merchant: 'Cloud Nine Cafe', category: 'Dining', amount: 42.35 },
  { id: 4, date: '2026-06-05', merchant: 'Northline Rent', category: 'Housing', amount: 1200.0 },
  { id: 5, date: '2026-06-06', merchant: 'Streamly', category: 'Subscriptions', amount: 17.99 },
  { id: 6, date: '2026-06-07', merchant: 'Urban Threads', category: 'Shopping', amount: 138.2 },
  { id: 7, date: '2026-06-09', merchant: 'Green Spoon', category: 'Dining', amount: 31.8 },
  { id: 8, date: '2026-06-11', merchant: 'Power & Water', category: 'Utilities', amount: 145.7 },
  { id: 9, date: '2026-06-13', merchant: 'Fresh Basket', category: 'Groceries', amount: 64.25 },
  { id: 10, date: '2026-06-15', merchant: 'Book Nook', category: 'Shopping', amount: 29.5 }
];

const categoryIcons = {
  Dining: Utensils,
  Groceries: ShoppingBag,
  Housing: Home,
  Shopping: CreditCard,
  Subscriptions: ReceiptText,
  Transport: ArrowDownUp,
  Utilities: WalletCards
};

const categoryColors = {
  Dining: '#ef7a46',
  Groceries: '#3f9f7f',
  Housing: '#5267d8',
  Shopping: '#c25ca7',
  Subscriptions: '#7a67bd',
  Transport: '#d7a12d',
  Utilities: '#4d92b8'
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

function App() {
  const [budget, setBudget] = useState(2400);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(demoTransactions.map((item) => item.category))).sort()],
    []
  );

  const filteredTransactions = useMemo(() => {
    const searchText = query.trim().toLowerCase();
    return demoTransactions.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category;
      const matchesQuery =
        !searchText ||
        item.merchant.toLowerCase().includes(searchText) ||
        item.category.toLowerCase().includes(searchText);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const totals = useMemo(() => {
    const spent = filteredTransactions.reduce((sum, item) => sum + item.amount, 0);
    const allSpent = demoTransactions.reduce((sum, item) => sum + item.amount, 0);
    const highest = demoTransactions.reduce((top, item) => (item.amount > top.amount ? item : top));
    const categoryTotals = demoTransactions.reduce((result, item) => {
      result[item.category] = (result[item.category] || 0) + item.amount;
      return result;
    }, {});

    return {
      filteredSpent: spent,
      monthlySpent: allSpent,
      remaining: budget - allSpent,
      highest,
      categoryTotals: Object.entries(categoryTotals)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)
    };
  }, [budget, filteredTransactions]);

  const budgetProgress = Math.min((totals.monthlySpent / budget) * 100, 100);

  return (
    <main className="app-shell">
      <section className="workspace">
        <aside className="summary-panel" aria-label="Spend summary">
          <div className="brand-row">
            <div className="brand-mark">
              <PiggyBank size={28} aria-hidden="true" />
            </div>
            <div>
              <p className="eyebrow">June 2026</p>
              <h1>Spend Calculator</h1>
            </div>
          </div>

          <div className="budget-control">
            <label htmlFor="budget">Monthly budget</label>
            <div className="budget-input">
              <CircleDollarSign size={20} aria-hidden="true" />
              <input
                id="budget"
                type="number"
                min="1"
                step="50"
                value={budget}
                onChange={(event) => setBudget(Number(event.target.value) || 1)}
              />
            </div>
          </div>

          <div className="metric large">
            <span>Total spent</span>
            <strong>{currency.format(totals.monthlySpent)}</strong>
          </div>

          <div className="progress-track" aria-label={`${budgetProgress.toFixed(0)}% of budget spent`}>
            <span style={{ width: `${budgetProgress}%` }} />
          </div>

          <div className="quick-stats">
            <div className="metric">
              <span>Remaining</span>
              <strong className={totals.remaining < 0 ? 'danger' : ''}>
                {currency.format(totals.remaining)}
              </strong>
            </div>
            <div className="metric">
              <span>Biggest item</span>
              <strong>{currency.format(totals.highest.amount)}</strong>
            </div>
          </div>

          <div className="category-list">
            <div className="section-heading">
              <Coffee size={18} aria-hidden="true" />
              <span>Categories</span>
            </div>
            {totals.categoryTotals.map((item) => {
              const Icon = categoryIcons[item.name] || ReceiptText;
              const percentage = (item.amount / totals.monthlySpent) * 100;
              return (
                <button
                  className={`category-row ${category === item.name ? 'active' : ''}`}
                  key={item.name}
                  onClick={() => setCategory(item.name)}
                >
                  <span className="category-icon" style={{ backgroundColor: categoryColors[item.name] }}>
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <span>{item.name}</span>
                  <strong>{percentage.toFixed(0)}%</strong>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="content-panel">
          <header className="toolbar">
            <div className="search-box">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                placeholder="Search merchant or category"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <div className="filter-box">
              <Filter size={17} aria-hidden="true" />
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </header>

          <section className="cards-grid" aria-label="Filtered totals">
            <div className="stat-card">
              <CalendarDays size={21} aria-hidden="true" />
              <span>Filtered spend</span>
              <strong>{currency.format(totals.filteredSpent)}</strong>
            </div>
            <div className="stat-card">
              <ReceiptText size={21} aria-hidden="true" />
              <span>Transactions</span>
              <strong>{filteredTransactions.length}</strong>
            </div>
            <div className="stat-card">
              <WalletCards size={21} aria-hidden="true" />
              <span>Average purchase</span>
              <strong>
                {currency.format(
                  filteredTransactions.length ? totals.filteredSpent / filteredTransactions.length : 0
                )}
              </strong>
            </div>
          </section>

          <section className="transaction-section">
            <div className="section-title">
              <h2>Transactions</h2>
              <p>{category === 'All' ? 'All demo expenses' : `${category} expenses`}</p>
            </div>

            <div className="transaction-list">
              {filteredTransactions.map((item) => {
                const Icon = categoryIcons[item.category] || ReceiptText;
                return (
                  <article className="transaction-row" key={item.id}>
                    <span className="category-icon" style={{ backgroundColor: categoryColors[item.category] }}>
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <div>
                      <strong>{item.merchant}</strong>
                      <span>{item.category}</span>
                    </div>
                    <time dateTime={item.date}>
                      {new Date(`${item.date}T00:00:00`).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </time>
                    <b>{currency.format(item.amount)}</b>
                  </article>
                );
              })}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
