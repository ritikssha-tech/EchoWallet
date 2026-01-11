// Room page logic

let currentRoom = null;
let currentPeople = [];
let splitSelection = new Set();
let editingPersonIndex = -1;

// Make functions globally accessible for onclick handlers
window.handleEditPerson = function(index) {
    editingPersonIndex = index;
    renderPeopleList();
};

window.handleSavePersonEdit = function(index) {
    const input = document.getElementById(`editPersonName_${index}`);
    if (!input) return;
    
    const newName = input.value.trim();
    const oldName = currentPeople[index];
    
    if (!newName) {
        alert('Please enter a name');
        return;
    }
    
    if (newName === oldName) {
        // No change
        editingPersonIndex = -1;
        renderPeopleList();
        return;
    }
    
    // Check if new name already exists
    if (currentPeople.includes(newName) && newName !== oldName) {
        alert('This name already exists');
        return;
    }
    
    // Update person name in people array
    currentPeople[index] = newName;
    const sortedPeople = [...currentPeople].sort();
    currentPeople = sortedPeople;
    
    // Update all expenses that reference the old name
    currentRoom.expenses.forEach(expense => {
        if (expense.paidBy === oldName) {
            expense.paidBy = newName;
        }
        expense.splitBetween = expense.splitBetween.map(p => p === oldName ? newName : p);
    });
    
    // Update room
    currentRoom.people = currentPeople;
    saveRoom(currentRoom);
    
    // Reset editing state
    editingPersonIndex = -1;
    
    // Re-render everything
    renderPeopleList();
    renderExpenseForm();
    renderExpenseList();
    renderDebtSettlement();
    showToast('Person name updated!', 'success');
};

window.handleCancelPersonEdit = function() {
    editingPersonIndex = -1;
    renderPeopleList();
};

// Initialize room page
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');
    
    if (!roomId) {
        window.location.href = 'index.html';
        return;
    }
    
    loadRoom(roomId);
    setupEventListeners();
});

function loadRoom(roomId) {
    const room = getRoom(roomId);
    
    if (!room) {
        window.location.href = 'index.html';
        return;
    }
    
    currentRoom = room;
    updatePeople();
    renderRoomHeader();
    renderPeopleList();
    renderExpenseForm();
    renderExpenseList();
    renderDebtSettlement();
}

function updatePeople() {
    // Get people from room.people or from expenses, or use defaults
    if (currentRoom.people && currentRoom.people.length > 0) {
        currentPeople = [...currentRoom.people];
    } else if (currentRoom.expenses.length > 0) {
        currentPeople = getAllPeople(currentRoom);
        // Save discovered people to room
        currentRoom.people = currentPeople;
        saveRoom(currentRoom);
    } else {
        currentPeople = ['Person 1', 'Person 2'];
        // Save default people to room
        currentRoom.people = currentPeople;
        saveRoom(currentRoom);
    }
}

function setupEventListeners() {
    // Back button
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    // Copy button
    document.getElementById('copyBtn').addEventListener('click', handleCopy);
    
    // Expense form
    document.getElementById('expenseForm').addEventListener('submit', handleExpenseSubmit);
    
    // Split buttons
    document.getElementById('selectAllBtn').addEventListener('click', () => {
        splitSelection = new Set(currentPeople);
        renderSplitButtons();
    });
    
    document.getElementById('clearAllBtn').addEventListener('click', () => {
        splitSelection = new Set();
        renderSplitButtons();
    });
    
    // People management
    document.getElementById('addPersonBtn').addEventListener('click', () => {
        const form = document.getElementById('addPersonForm');
        form.style.display = 'block';
        document.getElementById('newPersonName').focus();
    });
    
    document.getElementById('savePersonBtn').addEventListener('click', handleAddPerson);
    document.getElementById('cancelPersonBtn').addEventListener('click', () => {
        document.getElementById('addPersonForm').style.display = 'none';
        document.getElementById('newPersonName').value = '';
    });
    
    document.getElementById('newPersonName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddPerson();
        }
    });
    
    // Close edit form when clicking add person
    document.getElementById('addPersonBtn').addEventListener('click', () => {
        if (editingPersonIndex !== -1) {
            editingPersonIndex = -1;
            renderPeopleList();
        }
    });
}

function renderRoomHeader() {
    const roomUrl = `${window.location.origin}${window.location.pathname}?id=${currentRoom.id}`;
    document.getElementById('roomUrl').textContent = roomUrl;
}

async function handleCopy() {
    const roomUrl = `${window.location.origin}${window.location.pathname}?id=${currentRoom.id}`;
    const success = await copyToClipboard(roomUrl);
    
    if (success) {
        const copyIcon = document.getElementById('copyIcon');
        const copyText = document.getElementById('copyText');
        
        copyIcon.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';
        copyText.textContent = 'Copied!';
        
        setTimeout(() => {
            copyIcon.innerHTML = '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>';
            copyText.textContent = 'Copy Link';
        }, 2000);
    }
}

function renderExpenseForm() {
    const paidBySelect = document.getElementById('expensePaidBy');
    paidBySelect.innerHTML = '';
    
    currentPeople.forEach(person => {
        const option = document.createElement('option');
        option.value = person;
        option.textContent = person;
        paidBySelect.appendChild(option);
    });
    
    if (currentPeople.length > 0 && !paidBySelect.value) {
        paidBySelect.value = currentPeople[0];
    }
    
    renderSplitButtons();
}

function renderSplitButtons() {
    const container = document.getElementById('splitButtons');
    container.innerHTML = '';
    
    currentPeople.forEach(person => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `split-button ${splitSelection.has(person) ? 'active' : ''}`;
        button.textContent = person;
        button.addEventListener('click', () => {
            if (splitSelection.has(person)) {
                splitSelection.delete(person);
            } else {
                splitSelection.add(person);
            }
            renderSplitButtons();
        });
        container.appendChild(button);
    });
}

function handleExpenseSubmit(e) {
    e.preventDefault();
    
    const description = document.getElementById('expenseDescription').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const paidBy = document.getElementById('expensePaidBy').value;
    
    if (!description || !amount || amount <= 0 || splitSelection.size === 0) {
        return;
    }
    
    const expense = {
        id: generateRoomId(),
        description,
        amount,
        paidBy,
        splitBetween: Array.from(splitSelection),
        timestamp: Date.now()
    };
    
    const success = addExpense(currentRoom.id, expense);
    
    if (success) {
        loadRoom(currentRoom.id);
        document.getElementById('expenseForm').reset();
        splitSelection = new Set();
        renderSplitButtons();
        showToast('Expense added successfully!', 'success');
        
        // Celebrate with animation
        const formContainer = document.getElementById('expenseFormContainer');
        if (formContainer) {
            celebrateSuccess(formContainer);
        }
    }
}

function renderExpenseList() {
    const container = document.getElementById('expenseListContainer');
    const list = document.getElementById('expenseList');
    
    if (currentRoom.expenses.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    list.innerHTML = '';
    
    currentRoom.expenses.forEach((expense, index) => {
        const item = document.createElement('div');
        item.className = 'expense-item';
        item.style.animationDelay = `${index * 0.05}s`;
        
        const amountPerPerson = expense.amount / expense.splitBetween.length;
        
        item.innerHTML = `
            <div class="expense-header">
                <h3 class="expense-title">${escapeHtml(expense.description)}</h3>
                <span class="expense-amount">${formatCurrency(expense.amount)}</span>
            </div>
            <div class="expense-details">
                <strong>Paid by:</strong> ${escapeHtml(expense.paidBy)}
            </div>
            <div class="expense-details">
                <strong>Split between:</strong> ${expense.splitBetween.map(p => escapeHtml(p)).join(', ')}
            </div>
            <div class="expense-meta">
                ${new Date(expense.timestamp).toLocaleString()}
            </div>
            <div class="expense-actions">
                <button class="action-btn delete" onclick="handleDeleteExpense('${expense.id}')" title="Delete expense">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;
        
        list.appendChild(item);
    });
}

function handleDeleteExpense(expenseId) {
    if (confirm('Are you sure you want to delete this expense?')) {
        const success = deleteExpense(currentRoom.id, expenseId);
        
        if (success) {
            loadRoom(currentRoom.id);
            showToast('Expense deleted!');
        }
    }
}

function renderDebtSettlement() {
    const container = document.getElementById('debtSettlementContainer');
    const list = document.getElementById('debtList');
    
    const debts = calculateDebts(currentRoom);
    
    if (debts.length === 0) {
        container.style.display = 'block';
        list.innerHTML = `
            <div class="settled-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <div>
                    <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">All Settled!</h3>
                    <p style="color: var(--text-secondary);">No outstanding debts. Everyone is even.</p>
                </div>
            </div>
        `;
        return;
    }
    
    container.style.display = 'block';
    list.innerHTML = '';
    
    debts.forEach((debt, index) => {
        const item = document.createElement('div');
        item.className = 'debt-item';
        item.style.animationDelay = `${index * 0.05}s`;
        
        item.innerHTML = `
            <div class="debt-content">
                <div class="debt-names">
                    <span class="debt-name">${escapeHtml(debt.from)}</span>
                    <svg class="debt-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                    <span class="debt-name">${escapeHtml(debt.to)}</span>
                </div>
                <span class="debt-amount">${formatCurrency(debt.amount)}</span>
            </div>
        `;
        
        list.appendChild(item);
    });
}

function renderPeopleList() {
    const container = document.getElementById('peopleList');
    container.innerHTML = '';
    
    if (currentPeople.length === 0) {
        container.innerHTML = '<p class="empty-message">No people added yet. Click "Add Person" to get started.</p>';
        return;
    }
    
    currentPeople.forEach((person, index) => {
        if (editingPersonIndex === index) {
            // Show edit form
            const editForm = document.createElement('div');
            editForm.className = 'person-edit-form';
            editForm.innerHTML = `
                <input type="text" id="editPersonName_${index}" value="${escapeHtml(person)}" maxlength="50" class="person-edit-input">
                <div class="person-edit-actions">
                    <button class="person-save-btn" onclick="window.handleSavePersonEdit(${index})" title="Save">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </button>
                    <button class="person-cancel-btn" onclick="window.handleCancelPersonEdit()" title="Cancel">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `;
            container.appendChild(editForm);
            
            // Focus and select text
            setTimeout(() => {
                const input = document.getElementById(`editPersonName_${index}`);
                if (input) {
                    input.focus();
                    input.select();
                    
                    // Handle Enter and Escape keys
                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            window.handleSavePersonEdit(index);
                        }
                    });
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Escape') {
                            window.handleCancelPersonEdit();
                        }
                    });
                }
            }, 10);
        } else {
            // Show normal person item
            const personItem = document.createElement('div');
            personItem.className = 'person-item';
            personItem.innerHTML = `
                <span class="person-name">${escapeHtml(person)}</span>
                <div class="person-actions">
                    <button class="person-edit-btn" onclick="window.handleEditPerson(${index})" title="Edit name">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="person-delete-btn" onclick="window.handleDeletePerson('${escapeHtml(person)}')" title="Remove person">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `;
            container.appendChild(personItem);
        }
    });
}


function handleAddPerson() {
    const nameInput = document.getElementById('newPersonName');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Please enter a name');
        return;
    }
    
    if (currentPeople.includes(name)) {
        alert('This person already exists');
        return;
    }
    
    currentPeople.push(name);
    currentPeople.sort();
    
    // Update room
    currentRoom.people = currentPeople;
    saveRoom(currentRoom);
    
    // Hide form and reset
    document.getElementById('addPersonForm').style.display = 'none';
    nameInput.value = '';
    
    // Re-render
    renderPeopleList();
    renderExpenseForm();
    showToast('Person added!', 'success');
    
    // Celebrate
    const peopleContainer = document.getElementById('peopleContainer');
    if (peopleContainer) {
        celebrateSuccess(peopleContainer);
    }
}

window.handleDeletePerson = function(personName) {
    // Check if person is used in any expenses
    const isUsed = currentRoom.expenses.some(expense => 
        expense.paidBy === personName || expense.splitBetween.includes(personName)
    );
    
    if (isUsed) {
        if (!confirm(`"${personName}" is used in expenses. Are you sure you want to remove them? This won't delete the expenses.`)) {
            return;
        }
    }
    
    currentPeople = currentPeople.filter(p => p !== personName);
    
    // Update room
    currentRoom.people = currentPeople;
    saveRoom(currentRoom);
    
    // Re-render
    renderPeopleList();
    renderExpenseForm();
    renderExpenseList();
    renderDebtSettlement();
    showToast('Person removed!', 'success');
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
