// Core utilities and storage functions

const STORAGE_PREFIX = 'echo-wallet-room-';

// Generate UUID for room ID
function generateRoomId() {
    if (typeof uuid !== 'undefined' && uuid.v4) {
        return uuid.v4();
    }
    // Fallback UUID generator (v4 format)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Format currency
function formatCurrency(amount) {
    return `₹${amount.toFixed(2)}`;
}

// Copy to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (err) {
            document.body.removeChild(textArea);
            return false;
        }
    }
}

// Storage functions
function getRoom(id) {
    try {
        const data = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
        if (!data) return null;
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading room from storage:', error);
        return null;
    }
}

function saveRoom(room) {
    try {
        localStorage.setItem(`${STORAGE_PREFIX}${room.id}`, JSON.stringify(room));
    } catch (error) {
        console.error('Error saving room to storage:', error);
    }
}

function addExpense(roomId, expense) {
    try {
        const room = getRoom(roomId);
        if (!room) return false;
        
        room.expenses.push(expense);
        saveRoom(room);
        return true;
    } catch (error) {
        console.error('Error adding expense:', error);
        return false;
    }
}

function updateExpense(roomId, expenseId, updatedExpense) {
    try {
        const room = getRoom(roomId);
        if (!room) return false;
        
        const index = room.expenses.findIndex(e => e.id === expenseId);
        if (index === -1) return false;
        
        room.expenses[index] = updatedExpense;
        saveRoom(room);
        return true;
    } catch (error) {
        console.error('Error updating expense:', error);
        return false;
    }
}

function deleteExpense(roomId, expenseId) {
    try {
        const room = getRoom(roomId);
        if (!room) return false;
        
        room.expenses = room.expenses.filter(e => e.id !== expenseId);
        saveRoom(room);
        return true;
    } catch (error) {
        console.error('Error deleting expense:', error);
        return false;
    }
}

// Get all unique people from expenses and room.people
function getAllPeople(room) {
    const peopleSet = new Set();
    
    // Add people from room.people if it exists
    if (room.people && Array.isArray(room.people)) {
        room.people.forEach(person => peopleSet.add(person));
    }
    
    // Add people from expenses
    room.expenses.forEach(expense => {
        peopleSet.add(expense.paidBy);
        expense.splitBetween.forEach(person => peopleSet.add(person));
    });
    
    return Array.from(peopleSet).sort();
}

// Update people list in room
function updateRoomPeople(roomId, people) {
    try {
        const room = getRoom(roomId);
        if (!room) return false;
        
        room.people = people;
        saveRoom(room);
        return true;
    } catch (error) {
        console.error('Error updating room people:', error);
        return false;
    }
}

// Debt Simplification Algorithm (Minimum Cash Flow)
function calculateDebts(room) {
    if (room.expenses.length === 0) return [];

    const people = getAllPeople(room);
    const balances = new Map();

    // Initialize balances
    people.forEach(person => balances.set(person, 0));

    // Calculate net balance for each person
    room.expenses.forEach(expense => {
        const amountPerPerson = expense.amount / expense.splitBetween.length;
        
        // Person who paid gets credited
        const currentPaid = balances.get(expense.paidBy) || 0;
        balances.set(expense.paidBy, currentPaid + expense.amount);
        
        // People who split owe their share
        expense.splitBetween.forEach(person => {
            const currentOwed = balances.get(person) || 0;
            balances.set(person, currentOwed - amountPerPerson);
        });
    });

    // Convert to arrays
    const creditors = [];
    const debtors = [];

    balances.forEach((balance, name) => {
        if (balance > 0.01) {
            creditors.push({ name, balance });
        } else if (balance < -0.01) {
            debtors.push({ name, balance: Math.abs(balance) });
        }
    });

    // Sort: largest first
    creditors.sort((a, b) => b.balance - a.balance);
    debtors.sort((a, b) => b.balance - a.balance);

    // Greedy algorithm: match largest creditor with largest debtor
    const transactions = [];
    let creditorIndex = 0;
    let debtorIndex = 0;

    while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
        const creditor = creditors[creditorIndex];
        const debtor = debtors[debtorIndex];

        if (creditor.balance < 0.01) {
            creditorIndex++;
            continue;
        }

        if (debtor.balance < 0.01) {
            debtorIndex++;
            continue;
        }

        const amount = Math.min(creditor.balance, debtor.balance);
        
        transactions.push({
            from: debtor.name,
            to: creditor.name,
            amount: Math.round(amount * 100) / 100
        });

        creditor.balance -= amount;
        debtor.balance -= amount;

        if (creditor.balance < 0.01) {
            creditorIndex++;
        }
        if (debtor.balance < 0.01) {
            debtorIndex++;
        }
    }

    return transactions;
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    const messageEl = toast.querySelector('.toast-message') || document.createElement('div');
    messageEl.className = 'toast-message';
    messageEl.textContent = message;
    
    if (!toast.querySelector('.toast-message')) {
        const dot = document.createElement('div');
        dot.className = 'toast-dot';
        toast.appendChild(dot);
        toast.appendChild(messageEl);
    }
    
    toast.classList.add('show');
    
    // Add success animation for positive messages
    if (type === 'success') {
        createConfetti();
        toast.classList.add('animate-success');
    }
    
    setTimeout(() => {
        toast.classList.remove('show', 'animate-success');
    }, 3000);
}

// Create confetti animation
function createConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    
    const colors = ['#a855f7', '#ec4899', '#3b82f6', '#10b981'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        container.appendChild(confetti);
    }
    
    setTimeout(() => {
        container.remove();
    }, 4000);
}

// Success celebration animation
function celebrateSuccess(element) {
    if (!element) return;
    
    element.classList.add('animate-success');
    setTimeout(() => {
        element.classList.remove('animate-success');
    }, 500);
}
