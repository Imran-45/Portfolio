// TaskFlow - Modern Todo App
class TaskFlow {
    constructor() {
        this.tasks = this.loadTasks();
        this.taskIdCounter = this.getNextId();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
        this.updateCounters();
    }

    bindEvents() {
        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());
        
        // Enter key to add task
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Clear all button
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAllTasks());

        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Auto-save on window close
        window.addEventListener('beforeunload', () => this.saveTasks());
    }

    addTask() {
        const input = document.getElementById('taskInput');
        const taskText = input.value.trim();

        if (!taskText) {
            this.showNotification('Please enter a task!', 'warning');
            return;
        }

        if (taskText.length > 100) {
            this.showNotification('Task is too long! Maximum 100 characters.', 'error');
            return;
        }

        const task = {
            id: this.taskIdCounter++,
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        this.tasks.unshift(task); // Add to beginning for latest first
        input.value = '';
        
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.updateCounters();
        
        this.showNotification('Task added successfully!', 'success');
    }

    deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;

        const taskElement = document.querySelector(`[data-id="${taskId}"]`);
        if (taskElement) {
            taskElement.classList.add('removing');
            
            setTimeout(() => {
                this.tasks = this.tasks.filter(task => task.id !== taskId);
                this.saveTasks();
                this.renderTasks();
                this.updateStats();
                this.updateCounters();
                this.showNotification('Task deleted!', 'info');
            }, 300);
        }
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.updateCounters();
            
            const message = task.completed ? 'Task completed! 🎉' : 'Task marked as pending';
            this.showNotification(message, task.completed ? 'success' : 'info');
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const newText = prompt('Edit task:', task.text);
        if (newText === null) return; // User cancelled
        
        const trimmedText = newText.trim();
        if (!trimmedText) {
            this.showNotification('Task cannot be empty!', 'warning');
            return;
        }

        if (trimmedText.length > 100) {
            this.showNotification('Task is too long! Maximum 100 characters.', 'error');
            return;
        }

        task.text = trimmedText;
        this.saveTasks();
        this.renderTasks();
        this.showNotification('Task updated!', 'success');
    }

    clearAllTasks() {
        if (this.tasks.length === 0) {
            this.showNotification('No tasks to clear!', 'info');
            return;
        }

        if (!confirm(`Are you sure you want to delete all ${this.tasks.length} tasks?`)) return;

        this.tasks = [];
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.updateCounters();
        this.showNotification('All tasks cleared!', 'info');
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });
        
        this.renderTasks();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            default:
                return this.tasks;
        }
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            taskList.style.display = 'none';
            emptyState.style.display = 'block';
            this.updateEmptyMessage();
        } else {
            taskList.style.display = 'flex';
            emptyState.style.display = 'none';
            
            taskList.innerHTML = filteredTasks.map(task => `
                <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="taskFlow.toggleTask(${task.id})"></div>
                    <span class="task-text">${this.escapeHtml(task.text)}</span>
                    <div class="task-actions">
                        <button class="task-btn btn-edit" onclick="taskFlow.editTask(${task.id})" title="Edit task">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="task-btn btn-delete" onclick="taskFlow.deleteTask(${task.id})" title="Delete task">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </li>
            `).join('');
        }
    }

    updateEmptyMessage() {
        const emptyState = document.getElementById('emptyState');
        const emptyIcon = emptyState.querySelector('.empty-icon i');
        const emptyTitle = emptyState.querySelector('.empty-title');
        const emptyText = emptyState.querySelector('p');

        switch (this.currentFilter) {
            case 'completed':
                emptyIcon.className = 'fas fa-check-circle';
                emptyTitle.textContent = 'No completed tasks';
                emptyText.textContent = 'Complete some tasks to see them here!';
                break;
            case 'pending':
                emptyIcon.className = 'fas fa-clock';
                emptyTitle.textContent = 'No pending tasks';
                emptyText.textContent = 'Great job! All tasks are completed!';
                break;
            default:
                emptyIcon.className = 'fas fa-clipboard-check';
                emptyTitle.textContent = 'No tasks yet';
                emptyText.textContent = 'Add your first task to get started!';
                break;
        }
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('pendingTasks').textContent = pending;
    }

    updateCounters() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;

        document.getElementById('allCount').textContent = total;
        document.getElementById('completedCount').textContent = completed;
        document.getElementById('pendingCount').textContent = pending;
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#667eea'
        };
        return colors[type] || colors.info;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTasks() {
        try {
            localStorage.setItem('taskflow-tasks', JSON.stringify(this.tasks));
            localStorage.setItem('taskflow-counter', this.taskIdCounter.toString());
        } catch (error) {
            console.error('Failed to save tasks:', error);
            this.showNotification('Failed to save tasks!', 'error');
        }
    }

    loadTasks() {
        try {
            const saved = localStorage.getItem('taskflow-tasks');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load tasks:', error);
            return [];
        }
    }

    getNextId() {
        try {
            const saved = localStorage.getItem('taskflow-counter');
            const maxId = this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.id)) : 0;
            return Math.max(saved ? parseInt(saved) : 1, maxId + 1);
        } catch (error) {
            return 1;
        }
    }
}

// Global functions for onclick handlers
function toggleTask(id) { taskFlow.toggleTask(id); }
function editTask(id) { taskFlow.editTask(id); }
function deleteTask(id) { taskFlow.deleteTask(id); }

// Initialize the app
const taskFlow = new TaskFlow();

// Add some helpful keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to add task
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        taskFlow.addTask();
    }
    
    // Escape to clear input
    if (e.key === 'Escape') {
        document.getElementById('taskInput').value = '';
        document.getElementById('taskInput').blur();
    }
});

// Add focus to input when page loads
window.addEventListener('load', () => {
    document.getElementById('taskInput').focus();
});

console.log('🚀 TaskFlow initialized successfully!');