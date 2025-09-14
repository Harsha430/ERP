package com.intern.erp.finance.controller;

import com.intern.erp.finance.model.Account;
import com.intern.erp.finance.service.AccountingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/accounts","/api/finance/accounts"})
public class AccountController {

    @Autowired
    private AccountingService accountService;

    @PostMapping()
    public ResponseEntity<Account> createAccount(@RequestBody Account account) {
        Account saved = accountService.createAccount(account);
        return ResponseEntity.ok(saved);
    }

    @GetMapping()
    public ResponseEntity<List<Account>> getAllAccounts() {
        List<Account> accounts = accountService.getAllAccounts();
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Account> getAccountById(@PathVariable Long id) {
        Account account = accountService.getAccountById(id);
        return ResponseEntity.ok(account);
    }
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<String> deactivateAccount(@PathVariable Long id) {
        return new ResponseEntity<>(accountService.deactivateAccount(id), HttpStatus.OK);
    }
    @PutMapping("/{id}/activate")
    public ResponseEntity<String> activateAccount(@PathVariable Long id) {
        return new ResponseEntity<>(accountService.activateAccount(id), HttpStatus.OK);
    }
}
