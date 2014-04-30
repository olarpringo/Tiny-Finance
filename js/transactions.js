/* global ensureType, Parasite, dataStage, transactions, wallets, tmp, qs, on, formatMoney, formatDate, daysAgo, toDashDate, parseDashDate, startOfDay, Obj */

(function() {
	'use strict';

	// Render transactions to table:
	var transactionsTbody = qs('.transactions');
	function renderTransaction(transaction) {
		ensureType(transaction, 'obj');

		var wallet = wallets.find({_id: transaction.wallet});

		var tr = tmp.transaction({
			title: transaction.title,
			id: transaction.id,
			ts: transaction.ts,
			amount: formatMoney(transaction.amount),
			relativeDate: daysAgo(transaction.date),
			date: formatDate(transaction.date),
			wallet: wallet.name
		});

		Obj.subscribe(wallet, function(wallet) {
			qs('.wallet', tr).textContent = wallet.name;
		});

		// Edit:
		on(qs('.actions .edit', tr), 'click', function() {
			startEdit(transaction);
		});

		// Delete:
		on(qs('.actions .delete', tr), 'click', function() {
			if (confirm('Delete?\n' + transaction.title)) {
				transactions.remove(transaction);
			}
		});

		return tr;
	}

	// Add transactions to table (recent first):
	window.dataStageTransactions = transactions.attach(new Parasite({
		renderer: renderTransaction,
		parent: transactionsTbody
	}));


	// Handle new transaction form entries:
	on(qs('.transaction-form'), 'submit', function(event) {
		// Don't submit the form:
		event.preventDefault();

		// Grab the transaction from the form:
		var dashDate = this.date.value;
		var transaction = {
			title: this.title.value,
			wallet: this.wallet.value,
			amount: +this.amount.value,
			date: dashDate ? parseDashDate(dashDate).getTime() : startOfDay()
		};

		// Add the new transaction to the transactions 'array':
		transactions.push(transaction);
	});




	// Edit transactions

	var transactionEditForm = qs('form.transaction-edit');

	var editTab = qs('.edit-tab', dataStage);
	var tableTab = qs('.table-tab', dataStage);
	on(qs('.close-icon', editTab), 'click', function(event) {
		event.stopPropagation();
		stopEdit();
	});

	var transactionBeingEdited;
	function startEdit(transaction) {
		ensureType(transaction, 'obj');
		transactionBeingEdited = transaction;

		// Stick the transaction data in the edit form:
		transactionEditForm.title.value = transactionBeingEdited.title;
		transactionEditForm.wallet.value = transactionBeingEdited.wallet;
		transactionEditForm.amount.value = transactionBeingEdited.amount;
		transactionEditForm.date.value = toDashDate(transactionBeingEdited.date);

		editTab.hidden = false;
		editTab.click();
	}

	function stopEdit() {
		editTab.hidden = true;
		tableTab.click();
	}

	function handleTransactionEdit(event) {
		/*jshint validthis: true */

		// Don't submit the form:
		event.preventDefault();

		// Grab the transaction from the form:
		var newData = {
			title: this.title.value,
			wallet: this.wallet.value,
			amount: +this.amount.value,
			date: parseDashDate(this.date.value).getTime()
		};

		// Replace old transaction object with new:
		transactions.edit(transactionBeingEdited, newData);

		stopEdit();
	}
	on(transactionEditForm, 'submit', handleTransactionEdit);

})();