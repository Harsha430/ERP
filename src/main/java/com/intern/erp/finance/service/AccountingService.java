package com.intern.erp.finance.service;

import com.intern.erp.finance.model.Account;
import com.intern.erp.finance.model.JournalEntry;
import com.intern.erp.finance.model.LedgerEntry;

import java.util.List;

public interface AccountingService {
    Account createAccount(Account account);
    List<Account> getAllAccounts();
    Account getAccountById(Long id);
    String deactivateAccount(Long id);
}
