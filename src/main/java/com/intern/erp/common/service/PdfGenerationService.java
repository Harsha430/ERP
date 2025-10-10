package com.intern.erp.common.service;

import com.intern.erp.hr.model.Payslip;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class PdfGenerationService {

    public byte[] generatePayslipPdf(Payslip payslip) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document();
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            document.open();

            // Set fonts
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font regularFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);

            // Company Header
            Paragraph companyHeader = new Paragraph("COMPANY ERP SYSTEM", titleFont);
            companyHeader.setAlignment(Element.ALIGN_CENTER);
            companyHeader.setSpacingAfter(10);
            document.add(companyHeader);

            Paragraph payslipTitle = new Paragraph("PAYSLIP", headerFont);
            payslipTitle.setAlignment(Element.ALIGN_CENTER);
            payslipTitle.setSpacingAfter(20);
            document.add(payslipTitle);

            // Employee Information Table
            PdfPTable empInfoTable = new PdfPTable(2);
            empInfoTable.setWidthPercentage(100);
            empInfoTable.setSpacingAfter(15);

            addInfoRow(empInfoTable, "Employee ID:", payslip.getEmployeeId(), boldFont, regularFont);
            addInfoRow(empInfoTable, "Employee Name:", payslip.getEmployeeName(), boldFont, regularFont);
            addInfoRow(empInfoTable, "Pay Period:", payslip.getPayrollMonth(), boldFont, regularFont);
            addInfoRow(empInfoTable, "Pay Date:", payslip.getPayDate().toString(), boldFont, regularFont);
            addInfoRow(empInfoTable, "Working Days:", String.valueOf(payslip.getWorkingDays()), boldFont, regularFont);
            addInfoRow(empInfoTable, "Present Days:", String.valueOf(payslip.getPresentDays()), boldFont, regularFont);

            document.add(empInfoTable);

            // Salary Details Table
            PdfPTable salaryTable = new PdfPTable(3);
            salaryTable.setWidthPercentage(100);
            salaryTable.setWidths(new float[]{3, 1, 1});
            salaryTable.setSpacingAfter(15);

            // Header row
            addHeaderCell(salaryTable, "Description", boldFont);
            addHeaderCell(salaryTable, "Earnings (₹)", boldFont);
            addHeaderCell(salaryTable, "Deductions (₹)", boldFont);

            // Earnings
            addSalaryRow(salaryTable, "Basic Salary", payslip.getBasicSalary(), null, regularFont);
            addSalaryRow(salaryTable, "House Rent Allowance", payslip.getHouseRentAllowance(), null, regularFont);
            addSalaryRow(salaryTable, "Transport Allowance", payslip.getTransportAllowance(), null, regularFont);
            addSalaryRow(salaryTable, "Medical Allowance", payslip.getMedicalAllowance(), null, regularFont);
            
            if (payslip.getOtherAllowances().compareTo(BigDecimal.ZERO) > 0) {
                addSalaryRow(salaryTable, "Other Allowances", payslip.getOtherAllowances(), null, regularFont);
            }

            // Deductions
            addSalaryRow(salaryTable, "Provident Fund", null, payslip.getProvidentFund(), regularFont);
            addSalaryRow(salaryTable, "Professional Tax", null, payslip.getProfessionalTax(), regularFont);
            addSalaryRow(salaryTable, "Income Tax (TDS)", null, payslip.getIncomeTax(), regularFont);
            
            if (payslip.getOtherDeductions().compareTo(BigDecimal.ZERO) > 0) {
                addSalaryRow(salaryTable, "Other Deductions", null, payslip.getOtherDeductions(), regularFont);
            }

            // Totals
            addSalaryRow(salaryTable, "GROSS SALARY", payslip.getGrossSalary(), null, boldFont, BaseColor.LIGHT_GRAY);
            addSalaryRow(salaryTable, "TOTAL DEDUCTIONS", null, payslip.getTotalDeductions(), boldFont, BaseColor.LIGHT_GRAY);

            document.add(salaryTable);

            // Net Salary
            PdfPTable netSalaryTable = new PdfPTable(2);
            netSalaryTable.setWidthPercentage(100);
            netSalaryTable.setSpacingAfter(15);
            
            PdfPCell netSalaryLabelCell = new PdfPCell(new Phrase("NET SALARY", boldFont));
            netSalaryLabelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            netSalaryLabelCell.setBackgroundColor(BaseColor.DARK_GRAY);
            netSalaryLabelCell.setPadding(10);
            
            PdfPCell netSalaryValueCell = new PdfPCell(new Phrase("₹" + formatAmount(payslip.getNetSalary()), boldFont));
            netSalaryValueCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            netSalaryValueCell.setBackgroundColor(BaseColor.DARK_GRAY);
            netSalaryValueCell.setPadding(10);
            
            netSalaryTable.addCell(netSalaryLabelCell);
            netSalaryTable.addCell(netSalaryValueCell);
            
            document.add(netSalaryTable);

            // Footer Information
            Paragraph status = new Paragraph("Status: " + payslip.getStatus(), regularFont);
            document.add(status);

            Paragraph generatedAt = new Paragraph("Generated on: " + 
                    payslip.getGeneratedAt().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss")), regularFont);
            document.add(generatedAt);

            document.add(Chunk.NEWLINE);
            
            Paragraph footer = new Paragraph("This is a computer-generated payslip and does not require a signature.", 
                    FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8));
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            
            log.info("PDF generated successfully for payslip: {}", payslip.getId());
            return baos.toByteArray();
            
        } catch (DocumentException e) {
            log.error("Error generating PDF for payslip: {}", payslip.getId(), e);
            throw new RuntimeException("Failed to generate payslip PDF", e);
        }
    }

    private void addInfoRow(PdfPTable table, String label, String value, Font boldFont, Font regularFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, boldFont));
        PdfPCell valueCell = new PdfPCell(new Phrase(value, regularFont));
        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addHeaderCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(8);
        table.addCell(cell);
    }

    private void addSalaryRow(PdfPTable table, String description, BigDecimal earnings, BigDecimal deductions, Font font) {
        addSalaryRow(table, description, earnings, deductions, font, null);
    }

    private void addSalaryRow(PdfPTable table, String description, BigDecimal earnings, BigDecimal deductions, 
                            Font font, BaseColor backgroundColor) {
        PdfPCell descCell = new PdfPCell(new Phrase(description, font));
        PdfPCell earningsCell = new PdfPCell(new Phrase(earnings != null ? formatAmount(earnings) : "-", font));
        PdfPCell deductionsCell = new PdfPCell(new Phrase(deductions != null ? formatAmount(deductions) : "-", font));

        earningsCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        deductionsCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        if (backgroundColor != null) {
            descCell.setBackgroundColor(backgroundColor);
            earningsCell.setBackgroundColor(backgroundColor);
            deductionsCell.setBackgroundColor(backgroundColor);
        }

        descCell.setPadding(5);
        earningsCell.setPadding(5);
        deductionsCell.setPadding(5);

        table.addCell(descCell);
        table.addCell(earningsCell);
        table.addCell(deductionsCell);
    }

    private String formatAmount(BigDecimal amount) {
        if (amount == null) return "0.00";
        return String.format("%.2f", amount);
    }
}