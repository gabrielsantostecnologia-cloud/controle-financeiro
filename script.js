class ControleFinanceiro {
    constructor() {
        this.transactions = this.loadTransactions();
        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.setCurrentDate();
        this.updateDisplay();
        this.populateFilterCategories();
    }

    setupEventListeners() {
        const form = document.getElementById('transaction-form');
        const clearAllBtn = document.getElementById('clear-all');
        const filterCategoria = document.getElementById('filter-categoria');
        const filterTipo = document.getElementById('filter-tipo');

        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        clearAllBtn.addEventListener('click', () => this.clearAllTransactions());
        filterCategoria.addEventListener('change', () => this.filterTransactions());
        filterTipo.addEventListener('change', () => this.filterTransactions());
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('data').value = today;
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            id: Date.now(),
            descricao: document.getElementById('descricao').value,
            valor: parseFloat(document.getElementById('valor').value),
            categoria: document.getElementById('categoria').value,
            data: document.getElementById('data').value,
            tipo: document.getElementById('tipo').value
        };

        this.addTransaction(formData);
        this.resetForm();
    }

    addTransaction(transaction) {
        this.transactions.push(transaction);
        this.saveTransactions();
        this.updateDisplay();
        this.populateFilterCategories();
    }

    deleteTransaction(id) {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveTransactions();
            this.updateDisplay();
            this.populateFilterCategories();
        }
    }

    clearAllTransactions() {
        if (confirm('Tem certeza que deseja excluir TODAS as transações? Esta ação não pode ser desfeita.')) {
            this.transactions = [];
            this.saveTransactions();
            this.updateDisplay();
            this.populateFilterCategories();
        }
    }

    resetForm() {
        document.getElementById('transaction-form').reset();
        this.setCurrentDate();
    }

    updateDisplay() {
        this.updateSummary();
        this.renderTransactions();
    }

    updateSummary() {
        const receitas = this.transactions
            .filter(t => t.tipo === 'receita')
            .reduce((sum, t) => sum + t.valor, 0);

        const despesas = this.transactions
            .filter(t => t.tipo === 'despesa')
            .reduce((sum, t) => sum + t.valor, 0);

        const saldo = receitas - despesas;

        document.getElementById('total-receitas').textContent = this.formatCurrency(receitas);
        document.getElementById('total-despesas').textContent = this.formatCurrency(despesas);
        document.getElementById('saldo-total').textContent = this.formatCurrency(saldo);

        // Atualizar cor do saldo
        const saldoElement = document.getElementById('saldo-total');
        saldoElement.style.color = saldo >= 0 ? '#4CAF50' : '#f44336';
    }

    renderTransactions(transactionsToRender = null) {
        const tbody = document.getElementById('transactions-body');
        const emptyState = document.getElementById('empty-state');
        const transactions = transactionsToRender || this.transactions;

        tbody.innerHTML = '';

        if (transactions.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        // Ordenar por data (mais recente primeiro)
        const sortedTransactions = [...transactions].sort((a, b) => new Date(b.data) - new Date(a.data));

        sortedTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.className = `transaction-${transaction.tipo}`;
            
            row.innerHTML = `
                <td>${this.formatDate(transaction.data)}</td>
                <td>${transaction.descricao}</td>
                <td>${transaction.categoria}</td>
                <td class="valor-${transaction.tipo}">
                    ${transaction.tipo === 'receita' ? '+' : '-'} ${this.formatCurrency(transaction.valor)}
                </td>
                <td>
                    <button class="btn-delete" onclick="app.deleteTransaction(${transaction.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });
    }

    filterTransactions() {
        const categoriaFilter = document.getElementById('filter-categoria').value;
        const tipoFilter = document.getElementById('filter-tipo').value;

        let filteredTransactions = this.transactions;

        if (categoriaFilter) {
            filteredTransactions = filteredTransactions.filter(t => t.categoria === categoriaFilter);
        }

        if (tipoFilter) {
            filteredTransactions = filteredTransactions.filter(t => t.tipo === tipoFilter);
        }

        this.renderTransactions(filteredTransactions);
    }

    populateFilterCategories() {
        const select = document.getElementById('filter-categoria');
        const categories = [...new Set(this.transactions.map(t => t.categoria))];
        
        // Manter a opção "Todas as categorias"
        select.innerHTML = '<option value="">Todas as categorias</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR');
    }

    saveTransactions() {
        localStorage.setItem('controle-financeiro-transactions', JSON.stringify(this.transactions));
    }

    loadTransactions() {
        const saved = localStorage.getItem('controle-financeiro-transactions');
        return saved ? JSON.parse(saved) : [];
    }
}

// Inicializar a aplicação
const app = new ControleFinanceiro();

// Adicionar algumas transações de exemplo na primeira vez
if (app.transactions.length === 0) {
    const exemploTransactions = [
        {
            id: 1,
            descricao: 'Salário',
            valor: 3500.00,
            categoria: 'Salário',
            data: new Date().toISOString().split('T')[0],
            tipo: 'receita'
        },
        {
            id: 2,
            descricao: 'Mercado',
            valor: 250.00,
            categoria: 'Alimentação',
            data: new Date().toISOString().split('T')[0],
            tipo: 'despesa'
        },
        {
            id: 3,
            descricao: 'Conta de luz',
            valor: 120.00,
            categoria: 'Moradia',
            data: new Date().toISOString().split('T')[0],
            tipo: 'despesa'
        }
    ];

    exemploTransactions.forEach(transaction => {
        app.addTransaction(transaction);
    });
}
