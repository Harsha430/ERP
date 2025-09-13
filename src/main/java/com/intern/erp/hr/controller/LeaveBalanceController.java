package com.intern.erp.hr.controller;

import com.intern.erp.hr.dto.LeaveBalanceDTO;
import com.intern.erp.hr.model.LeaveBalance;
import com.intern.erp.hr.service.LeaveBalanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hr/leave-balances")
@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:3000"})
public class LeaveBalanceController {
    
    @Autowired
    private LeaveBalanceService leaveBalanceService;
    
    @GetMapping
    public ResponseEntity<List<LeaveBalanceDTO>> getAllLeaveBalances() {
        try {
            List<LeaveBalanceDTO> balances = leaveBalanceService.getAggregatedLeaveBalances();
            return ResponseEntity.ok(balances);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/raw")
    public ResponseEntity<List<LeaveBalance>> getAllRawLeaveBalances() {
        try {
            List<LeaveBalance> balances = leaveBalanceService.getAllLeaveBalances();
            return ResponseEntity.ok(balances);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LeaveBalance>> getLeaveBalancesByEmployee(@PathVariable String employeeId) {
        try {
            List<LeaveBalance> balances = leaveBalanceService.getLeaveBalancesByEmployeeId(employeeId);
            return ResponseEntity.ok(balances);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<LeaveBalance> getLeaveBalanceById(@PathVariable String id) {
        try {
            return leaveBalanceService.getLeaveBalanceById(id)
                    .map(balance -> ResponseEntity.ok().body(balance))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    @PostMapping
    public ResponseEntity<LeaveBalance> createLeaveBalance(@RequestBody LeaveBalance leaveBalance) {
        try {
            LeaveBalance saved = leaveBalanceService.saveLeaveBalance(leaveBalance);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<LeaveBalance> updateLeaveBalance(@PathVariable String id, @RequestBody LeaveBalance leaveBalance) {
        try {
            leaveBalance.setId(id);
            LeaveBalance saved = leaveBalanceService.saveLeaveBalance(leaveBalance);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLeaveBalance(@PathVariable String id) {
        try {
            leaveBalanceService.deleteLeaveBalance(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Leave Balance API is working!");
    }
}