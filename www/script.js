
const $ = (id) => document.getElementById(id);

const STORAGE_KEY = "spendsmart_transactions";
const BUDGET_KEY = "spendsmart_monthly_budget";
const THEME_KEY = "spendsmart_dark_mode";

let transactions = [];
let budget = 10000;

const today = new Date();
const localToday = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0")
].join("-");

$("date").value = localToday;

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    transactions = Array.isArray(saved)
      ? saved.filter(t =>
          t &&
          typeof t.id === "string" &&
          typeof t.description === "string" &&
          Number.isFinite(t.amount) &&
          t.amount > 0 &&
          ["income", "expense"].includes(t.type) &&
          typeof t.category === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(t.date)
        )
      : [];
  } catch {
    transactions = [];
  }

  const savedBudget = Number(localStorage.getItem(BUDGET_KEY));
  budget = Number.isFinite(savedBudget) && savedBudget > 0
    ? savedBudget
    : 10000;

  document.body.classList.toggle(
    "dark",
    localStorage.getItem(THEME_KEY) === "true"
  );

  $("themeToggle").textContent =
    document.body.classList.contains("dark") ? "☀" : "☾";
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function currentMonthTransactions() {
  const month = localToday.slice(0, 7);
  return transactions.filter(t => t.date.slice(0, 7) === month);
}

function totals(list) {
  return list.reduce(
    (result, t) => {
      result[t.type] += t.amount;
      return result;
    },
    { income: 0, expense: 0 }
  );
}

function renderDashboard() {
  const allTotals = totals(transactions);
  const monthTotals = totals(currentMonthTransactions());

  $("balance").textContent = money(allTotals.income - allTotals.expense);
  $("income").textContent = money(allTotals.income);
  $("expenses").textContent = money(allTotals.expense);
  $("incomeStat").textContent = money(allTotals.income);
  $("expenseStat").textContent = money(allTotals.expense);

  $("budgetLabel").textContent =
    `${money(monthTotals.expense)} / ${money(budget)}`;

  const percentage = monthTotals.expense / budget * 100;
  $("budgetProgress").style.width =
    `${Math.min(percentage, 100)}%`;

  if (percentage >= 100) {
    $("budgetMessage").textContent =
      "You've reached your monthly budget. Review your spending.";
    $("budgetProgress").style.background = "#cf6257";
  } else if (percentage >= 80) {
    $("budgetMessage").textContent =
      `${percentage.toFixed(0)}% of your budget used. You're getting close to the limit.`;
    $("budgetProgress").style.background = "#d7a64b";
  } else {
    $("budgetMessage").textContent =
      `${money(Math.max(0, budget - monthTotals.expense))} remaining this month.`;
    $("budgetProgress").style.background = "#619878";
  }
}

const categoryIcons = {
  Food: "🍽️",
  Travel: "🚕",
  Shopping: "🛍️",
  Education: "📚",
  Bills: "🧾",
  Health: "💊",
  Entertainment: "🎬",
  Salary: "💼",
  Allowance: "💰",
  Other: "📌"
};

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderTransactions() {
  const list = $("transactionList");
  list.replaceChildren();

  const sorted = [...transactions].sort((a, b) => {
    return b.date.localeCompare(a.date) || b.id.localeCompare(a.id);
  });

  $("transactionCount").textContent =
    `${transactions.length} ${transactions.length === 1 ? "record" : "records"}`;

  $("emptyState").hidden = sorted.length > 0;

  sorted.forEach(transaction => {
    const item = makeElement("article", "transaction-item");

    const icon = makeElement(
      "div",
      "transaction-icon",
      categoryIcons[transaction.category] || "📌"
    );

    const info = makeElement("div", "transaction-info");
    info.append(
      makeElement("strong", "", transaction.description),
      makeElement(
        "small",
        "",
        `${transaction.category} · ${formatDate(transaction.date)}`
      )
    );

    const right = makeElement("div", "transaction-right");
    const isIncome = transaction.type === "income";

    right.append(
      makeElement(
        "span",
        `transaction-amount ${isIncome ? "positive" : "negative"}`,
        `${isIncome ? "+" : "−"}${money(transaction.amount)}`
      )
    );

    const deleteButton = makeElement("button", "delete-btn", "Delete");
    deleteButton.type = "button";
    deleteButton.setAttribute(
      "aria-label",
      `Delete transaction ${transaction.description}`
    );

    deleteButton.addEventListener("click", () => {
      const confirmed = confirm(
        `Delete "${transaction.description}"?`
      );

      if (!confirmed) return;

      transactions = transactions.filter(t => t.id !== transaction.id);
      saveTransactions();
      renderAll();
    });

    right.append(deleteButton);
    item.append(icon, info, right);
    list.append(item);
  });
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function renderAll() {
  renderDashboard();
  renderTransactions();
}

$("transactionForm").addEventListener("submit", event => {
  event.preventDefault();

  const description = $("description").value.trim();
  const amount = Number($("amount").value);
  const type = $("type").value;
  const category = $("category").value;
  const date = $("date").value;

  if (!description) {
    alert("Please enter a transaction description.");
    return;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    alert("Please enter an amount greater than zero.");
    return;
  }

  if (!["income", "expense"].includes(type)) {
    alert("Please select a valid transaction type.");
    return;
  }

  if (!date || date > localToday) {
    alert("Please select a valid date that is not in the future.");
    return;
  }

  const transaction = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    description,
    amount: Math.round((amount + Number.EPSILON) * 100) / 100,
    type,
    category,
    date
  };

  transactions.push(transaction);
  saveTransactions();
  renderAll();

  $("transactionForm").reset();
  $("date").value = localToday;
  $("type").value = "expense";
  $("description").focus();
});

$("editBudget").addEventListener("click", () => {
  const input = prompt(
    "Enter your monthly spending budget in rupees:",
    String(budget)
  );

  if (input === null) return;

  const newBudget = Number(input);

  if (!Number.isFinite(newBudget) || newBudget <= 0) {
    alert("Please enter a valid budget greater than zero.");
    return;
  }

  budget = Math.round((newBudget + Number.EPSILON) * 100) / 100;
  localStorage.setItem(BUDGET_KEY, String(budget));
  renderDashboard();
});

$("themeToggle").addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, String(isDark));
  $("themeToggle").textContent = isDark ? "☀" : "☾";
});

loadData();
renderAll();
