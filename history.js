// History page logic

let allRooms = [];

document.addEventListener('DOMContentLoaded', () => {
    loadAllRooms();
    setupEventListeners();
    updateStats();
    renderRooms();
    updateStorageInfo();
});

function setupEventListeners() {
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    document.getElementById('clearStorageBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all data? This will delete all rooms and expenses permanently.')) {
            clearAllStorage();
        }
    });
}

function loadAllRooms() {
    allRooms = [];
    const STORAGE_PREFIX = 'echo-wallet-room-';
    
    // Get all keys from localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
            try {
                const roomData = JSON.parse(localStorage.getItem(key));
                if (roomData && roomData.id) {
                    allRooms.push(roomData);
                }
            } catch (error) {
                console.error('Error parsing room data:', error);
            }
        }
    }
    
    // Sort by creation date (newest first)
    allRooms.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

function updateStats() {
    const totalRooms = allRooms.length;
    let totalExpenses = 0;
    let totalAmount = 0;
    
    allRooms.forEach(room => {
        totalExpenses += room.expenses ? room.expenses.length : 0;
        if (room.expenses) {
            room.expenses.forEach(expense => {
                totalAmount += expense.amount || 0;
            });
        }
    });
    
    document.getElementById('totalRooms').textContent = totalRooms;
    document.getElementById('totalExpenses').textContent = totalExpenses;
    document.getElementById('totalAmount').textContent = formatCurrency(totalAmount);
    
    // Animate stats
    animateValue('totalRooms', 0, totalRooms, 1000);
    animateValue('totalExpenses', 0, totalExpenses, 1000);
}

function animateValue(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startTime = performance.now();
    const isCurrency = elementId === 'totalAmount';
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = start + (end - start) * easeOutCubic(progress);
        
        if (isCurrency) {
            element.textContent = formatCurrency(current);
        } else {
            element.textContent = Math.floor(current);
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function renderRooms() {
    const container = document.getElementById('roomsList');
    const emptyState = document.getElementById('emptyState');
    
    if (allRooms.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    container.innerHTML = '';
    
    allRooms.forEach((room, index) => {
        const roomCard = createRoomCard(room, index);
        container.appendChild(roomCard);
    });
}

function createRoomCard(room, index) {
    const card = document.createElement('div');
    card.className = 'room-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    const expenseCount = room.expenses ? room.expenses.length : 0;
    const totalAmount = room.expenses ? room.expenses.reduce((sum, e) => sum + (e.amount || 0), 0) : 0;
    const peopleCount = room.people ? room.people.length : (room.expenses ? getAllPeople(room).length : 0);
    const createdDate = new Date(room.createdAt || Date.now());
    const lastUpdated = room.expenses && room.expenses.length > 0 
        ? new Date(Math.max(...room.expenses.map(e => e.timestamp)))
        : createdDate;
    
    card.innerHTML = `
        <div class="room-card-header">
            <div>
                <h3>${escapeHtml(room.name || 'Expense Room')}</h3>
                <p class="room-card-id">ID: ${room.id.substring(0, 8)}...</p>
            </div>
            <button class="room-delete-btn" onclick="window.handleDeleteRoom('${room.id}')" title="Delete room">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
        <div class="room-card-stats">
            <div class="room-stat">
                <span class="room-stat-value">${expenseCount}</span>
                <span class="room-stat-label">Expenses</span>
            </div>
            <div class="room-stat">
                <span class="room-stat-value">${peopleCount}</span>
                <span class="room-stat-label">People</span>
            </div>
            <div class="room-stat">
                <span class="room-stat-value">${formatCurrency(totalAmount)}</span>
                <span class="room-stat-label">Total</span>
            </div>
        </div>
        <div class="room-card-footer">
            <div class="room-dates">
                <p><strong>Created:</strong> ${createdDate.toLocaleDateString()}</p>
                ${expenseCount > 0 ? `<p><strong>Last Updated:</strong> ${lastUpdated.toLocaleDateString()}</p>` : ''}
            </div>
            <a href="room.html?id=${room.id}" class="btn-primary btn-small">Open Room</a>
        </div>
    `;
    
    return card;
}

window.handleDeleteRoom = function(roomId) {
    if (confirm('Are you sure you want to delete this room? All expenses will be permanently deleted.')) {
        const STORAGE_PREFIX = 'echo-wallet-room-';
        localStorage.removeItem(`${STORAGE_PREFIX}${roomId}`);
        
        // Reload
        loadAllRooms();
        updateStats();
        renderRooms();
        updateStorageInfo();
        showToast('Room deleted!');
    }
};

function updateStorageInfo() {
    let totalSize = 0;
    const STORAGE_PREFIX = 'echo-wallet-room-';
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
            const value = localStorage.getItem(key);
            if (value) {
                totalSize += new Blob([value]).size;
            }
        }
    }
    
    const sizeInKB = (totalSize / 1024).toFixed(2);
    document.getElementById('storageUsed').textContent = `${sizeInKB} KB`;
}

function clearAllStorage() {
    const STORAGE_PREFIX = 'echo-wallet-room-';
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Reload
    loadAllRooms();
    updateStats();
    renderRooms();
    updateStorageInfo();
    showToast('All data cleared!');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
