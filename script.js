let isLogin = true;
let expenses = [];
let chartRef;

function toggleForm() {
  isLogin = !isLogin;
  document.getElementById("formTitle").textContent = isLogin ? "Login" : "Sign Up";
  document.getElementById("name").style.display = isLogin ? "none" : "block";
  document.getElementById("confirmPassword").style.display = isLogin ? "none" : "block";
  document.querySelector(".toggle").textContent = isLogin
    ? "Don't have an account? Sign Up"
    : "Already have an account? Login";
}

function submitForm() {
  const name = document.getElementById("name")?.value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword")?.value;

  if (!email || !password || (!isLogin && (!name || !confirmPassword))) {
    alert("Please fill in all fields.");
    return;
  }
  if (!isLogin && password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }
  window.location.href = "dashboard.html";
}

function addExpense() {
  const dropdownName = document.getElementById('expenseDropdown').value;
  const customName = document.getElementById('customExpense').value.trim();
  const amount = parseFloat(document.getElementById('expenseAmount').value);
  const name = customName || dropdownName;

  if (name && amount && amount > 0) {
    expenses.push({ name, amount });
    updateExpenseList();
    document.getElementById('expenseAmount').value = "";
    document.getElementById('customExpense').value = "";
  }
}

function updateExpenseList() {
  const list = document.getElementById('expenseList');
  if (!list) return;
  list.innerHTML = '';
  expenses.forEach((exp, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${exp.name}: ₹${exp.amount}
      <button onclick="editExpense(${index})">✏️</button>
      <button onclick="deleteExpense(${index})">❌</button>
    `;
    list.appendChild(li);
  });
}

function editExpense(index) {
  const exp = expenses[index];
  const newName = prompt("Edit expense name:", exp.name);
  const newAmount = parseFloat(prompt("Edit expense amount (₹):", exp.amount));

  if (newName && !isNaN(newAmount) && newAmount > 0) {
    expenses[index] = { name: newName, amount: newAmount };
    updateExpenseList();
  } else {
    alert("Invalid input. Please try again.");
  }
}

function deleteExpense(index) {
  if (confirm("Are you sure you want to delete this expense?")) {
    expenses.splice(index, 1);
    updateExpenseList();
  }
}

function generateSuggestion() {
  const income = parseFloat(document.getElementById('income').value);
  const goal = parseFloat(document.getElementById('goal').value);
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const suggestionBox = document.getElementById('suggestion');

  if (!income || !goal) {
    suggestionBox.innerHTML = "Please enter valid income and savings goal.";
    return;
  }

  const suggestedBudget = income - goal;
  const remaining = income - totalSpent;

  let investmentSuggestion = "Invest 50% of your savings in mutual funds.";
  if (goal < income * 0.2) {
    investmentSuggestion = "Increase your savings goal for better financial growth.";
  } else if (goal > income * 0.5) {
    investmentSuggestion = "Excellent savings! Diversify in bonds and equities.";
  }

  suggestionBox.innerHTML = `
    <strong>Total Spent:</strong> ₹${totalSpent}<br/>
    <strong>Remaining:</strong> ₹${remaining}<br/>
    <strong>Suggested Max Spend:</strong> ₹${suggestedBudget}<br/>
    <strong>Tip:</strong> ${investmentSuggestion}<br/>
    ${totalSpent > suggestedBudget
      ? "<span style='color:red;'>You're overspending!</span>"
      : "<span style='color:green;'>You're on track!</span>"}
  `;

  drawChart(income, totalSpent, goal);
}

function drawChart(income, spent, goal) {
  const ctx = document.getElementById('chart').getContext('2d');
  if (chartRef) chartRef.destroy();
  chartRef = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Spent', 'Savings Goal', 'Remaining'],
      datasets: [{
        data: [spent, goal, Math.max(0, income - spent - goal)],
        backgroundColor: ['#e74c3c', '#2ecc71', '#f1c40f']
      }]
    },
    options: { responsive: false }
  });
}

async function downloadReport() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const income = document.getElementById('income').value;
  const goal = document.getElementById('goal').value;
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = income - totalSpent;

  doc.setFontSize(16);
  doc.text("Financial Report", 80, 10);
  doc.setFontSize(12);
  doc.text(`Income: ₹${income}`, 10, 20);
  doc.text(`Savings Goal: ₹${goal}`, 10, 30);
  doc.text(`Spent: ₹${totalSpent}`, 10, 40);
  doc.text(`Remaining: ₹${remaining}`, 10, 50);
  let y = 60;
  expenses.forEach(exp => {
    doc.text(`• ${exp.name}: ₹${exp.amount}`, 10, y);
    y += 6;
  });
  doc.save("Report.pdf");
}

function saveReportLocally() {
  const income = document.getElementById('income').value;
  const goal = document.getElementById('goal').value;
  const report = {
    income, goal, expenses,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('financialReport', JSON.stringify(report));
  alert("Report saved.");
}

function loadSavedReport() {
  const report = JSON.parse(localStorage.getItem('financialReport'));
  if (!report) return alert("No report found.");
  document.getElementById('income').value = report.income;
  document.getElementById('goal').value = report.goal;
  expenses = report.expenses || [];
  updateExpenseList();
  generateSuggestion();
}

function logout() {
  window.location.href = "index.html";
}
