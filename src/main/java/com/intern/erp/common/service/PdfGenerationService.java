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

    // Define professional color scheme
    private static final BaseColor PRIMARY_BLUE = new BaseColor(41, 98, 255);      // Professional blue
    private static final BaseColor SECONDARY_BLUE = new BaseColor(59, 130, 246);   // Light blue
    private static final BaseColor SUCCESS_GREEN = new BaseColor(16, 185, 129);    // Success green
    private static final BaseColor WARNING_ORANGE = new BaseColor(245, 158, 11);   // Warning orange
    private static final BaseColor DARK_GRAY = new BaseColor(55, 65, 81);          // Dark gray
    private static final BaseColor LIGHT_GRAY = new BaseColor(243, 244, 246);      // Light gray
    private static final BaseColor WHITE = BaseColor.WHITE;
    private static final BaseColor TEXT_GRAY = new BaseColor(75, 85, 99);          // Text gray

    public byte[] generatePayslipPdf(Payslip payslip) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 40, 40, 50, 50);
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            document.open();

            // Enhanced font definitions
            Font companyFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, PRIMARY_BLUE);
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, DARK_GRAY);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, DARK_GRAY);
            Font regularFont = FontFactory.getFont(FontFactory.HELVETICA, 10, TEXT_GRAY);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, WHITE);
            Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, DARK_GRAY);
            Font netSalaryFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, WHITE);

            // Professional Company Header with background
            PdfPTable headerTable = new PdfPTable(1);
            headerTable.setWidthPercentage(100);
            headerTable.setSpacingAfter(12);
            
            PdfPCell headerCell = new PdfPCell();
            headerCell.setBackgroundColor(PRIMARY_BLUE);
            headerCell.setBorder(Rectangle.NO_BORDER);
            headerCell.setPadding(15);
            
            Paragraph companyName = new Paragraph("COMPANY ERP SYSTEM", 
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, WHITE));
            companyName.setAlignment(Element.ALIGN_CENTER);
            
            Paragraph payslipTitle = new Paragraph("EMPLOYEE PAYSLIP", 
                FontFactory.getFont(FontFactory.HELVETICA, 12, WHITE));
            payslipTitle.setAlignment(Element.ALIGN_CENTER);
            payslipTitle.setSpacingBefore(4);
            
            headerCell.addElement(companyName);
            headerCell.addElement(payslipTitle);
            headerTable.addCell(headerCell);
            
            document.add(headerTable);

            // Enhanced Employee Information Section
            PdfPTable empInfoTable = new PdfPTable(4);
            empInfoTable.setWidthPercentage(100);
            empInfoTable.setWidths(new float[]{1.5f, 2f, 1.5f, 2f});
            empInfoTable.setSpacingAfter(12);
            
            // Add employee info with professional styling
            addEmployeeInfoRow(empInfoTable, "Employee ID", payslip.getEmployeeId(), "Employee Name", payslip.getEmployeeName(), boldFont, regularFont);
            addEmployeeInfoRow(empInfoTable, "Pay Period", payslip.getPayrollMonth(), "Pay Date", payslip.getPayDate().toString(), boldFont, regularFont);
            addEmployeeInfoRow(empInfoTable, "Working Days", String.valueOf(payslip.getWorkingDays()), "Present Days", String.valueOf(payslip.getPresentDays()), boldFont, regularFont);
            
            document.add(empInfoTable);

            // Professional Salary Details Table
            PdfPTable salaryTable = new PdfPTable(3);
            salaryTable.setWidthPercentage(100);
            salaryTable.setWidths(new float[]{3f, 1.5f, 1.5f});
            salaryTable.setSpacingAfter(12);

            // Enhanced Header row with gradient-like effect
            addProfessionalHeaderCell(salaryTable, "SALARY COMPONENTS", PRIMARY_BLUE, WHITE);
            addProfessionalHeaderCell(salaryTable, "EARNINGS (₹)", SUCCESS_GREEN, WHITE);
            addProfessionalHeaderCell(salaryTable, "DEDUCTIONS (₹)", WARNING_ORANGE, WHITE);

            // Earnings section with alternating row colors
            boolean isAlternate = false;
            addStyledSalaryRow(salaryTable, "Basic Salary", payslip.getBasicSalary(), null, 
                isAlternate ? LIGHT_GRAY : WHITE, regularFont);
            isAlternate = !isAlternate;
            
            addStyledSalaryRow(salaryTable, "House Rent Allowance (HRA)", payslip.getHouseRentAllowance(), null, 
                isAlternate ? LIGHT_GRAY : WHITE, regularFont);
            isAlternate = !isAlternate;
            
            addStyledSalaryRow(salaryTable, "Transport Allowance", payslip.getTransportAllowance(), null, 
                isAlternate ? LIGHT_GRAY : WHITE, regularFont);
            isAlternate = !isAlternate;
            
            addStyledSalaryRow(salaryTable, "Medical Allowance", payslip.getMedicalAllowance(), null, 
                isAlternate ? LIGHT_GRAY : WHITE, regularFont);
            isAlternate = !isAlternate;
            
            if (payslip.getOtherAllowances().compareTo(BigDecimal.ZERO) > 0) {
                addStyledSalaryRow(salaryTable, "Other Allowances", payslip.getOtherAllowances(), null, 
                    isAlternate ? LIGHT_GRAY : WHITE, regularFont);
                isAlternate = !isAlternate;
            }

            // Deductions section
            addStyledSalaryRow(salaryTable, "Provident Fund (PF)", null, payslip.getProvidentFund(), 
                isAlternate ? LIGHT_GRAY : WHITE, regularFont);
            isAlternate = !isAlternate;
            
            addStyledSalaryRow(salaryTable, "Professional Tax", null, payslip.getProfessionalTax(), 
                isAlternate ? LIGHT_GRAY : WHITE, regularFont);
            isAlternate = !isAlternate;
            
            addStyledSalaryRow(salaryTable, "Income Tax (TDS)", null, payslip.getIncomeTax(), 
                isAlternate ? LIGHT_GRAY : WHITE, regularFont);
            isAlternate = !isAlternate;
            
            if (payslip.getOtherDeductions().compareTo(BigDecimal.ZERO) > 0) {
                addStyledSalaryRow(salaryTable, "Other Deductions", null, payslip.getOtherDeductions(), 
                    isAlternate ? LIGHT_GRAY : WHITE, regularFont);
            }

            // Totals with special styling
            addTotalRow(salaryTable, "GROSS SALARY", payslip.getGrossSalary(), SUCCESS_GREEN, WHITE);
            addTotalRow(salaryTable, "TOTAL DEDUCTIONS", payslip.getTotalDeductions(), WARNING_ORANGE, WHITE);

            document.add(salaryTable);

            // Prominent Net Salary Section
            PdfPTable netSalaryTable = new PdfPTable(1);
            netSalaryTable.setWidthPercentage(100);
            netSalaryTable.setSpacingAfter(12);
            
            PdfPCell netSalaryCell = new PdfPCell();
            netSalaryCell.setBackgroundColor(PRIMARY_BLUE);
            netSalaryCell.setBorder(Rectangle.NO_BORDER);
            netSalaryCell.setPadding(12);
            
            Paragraph netSalaryLabel = new Paragraph("NET SALARY PAYABLE", 
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, WHITE));
            netSalaryLabel.setAlignment(Element.ALIGN_CENTER);
            
            Paragraph netSalaryAmount = new Paragraph("₹ " + formatAmount(payslip.getNetSalary()), 
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, WHITE));
            netSalaryAmount.setAlignment(Element.ALIGN_CENTER);
            netSalaryAmount.setSpacingBefore(5);
            
            netSalaryCell.addElement(netSalaryLabel);
            netSalaryCell.addElement(netSalaryAmount);
            netSalaryTable.addCell(netSalaryCell);
            
            document.add(netSalaryTable);

            // Professional Footer Section
            PdfPTable footerTable = new PdfPTable(2);
            footerTable.setWidthPercentage(100);
            footerTable.setWidths(new float[]{1f, 1f});
            footerTable.setSpacingAfter(8);
            
            // Status and generation info
            PdfPCell leftFooterCell = new PdfPCell();
            leftFooterCell.setBorder(Rectangle.NO_BORDER);
            leftFooterCell.setPadding(8);
            leftFooterCell.setBackgroundColor(LIGHT_GRAY);
            
            Paragraph statusPara = new Paragraph("Status: " + payslip.getStatus(), 
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, SUCCESS_GREEN));
            Paragraph generatedPara = new Paragraph("Generated on: " + 
                payslip.getGeneratedAt().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss")), 
                FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_GRAY));
            generatedPara.setSpacingBefore(2);
            
            leftFooterCell.addElement(statusPara);
            leftFooterCell.addElement(generatedPara);
            
            // Company signature area
            PdfPCell rightFooterCell = new PdfPCell();
            rightFooterCell.setBorder(Rectangle.NO_BORDER);
            rightFooterCell.setPadding(8);
            rightFooterCell.setBackgroundColor(LIGHT_GRAY);
            
            Paragraph signaturePara = new Paragraph("Authorized Signatory", 
                FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_GRAY));
            signaturePara.setAlignment(Element.ALIGN_RIGHT);
            signaturePara.setSpacingBefore(10);
            
            Paragraph companyPara = new Paragraph("Company ERP System", 
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, PRIMARY_BLUE));
            companyPara.setAlignment(Element.ALIGN_RIGHT);
            companyPara.setSpacingBefore(3);
            
            rightFooterCell.addElement(signaturePara);
            rightFooterCell.addElement(companyPara);
            
            footerTable.addCell(leftFooterCell);
            footerTable.addCell(rightFooterCell);
            document.add(footerTable);
            
            // Disclaimer
            Paragraph disclaimer = new Paragraph("This is a computer-generated payslip and does not require a physical signature.", 
                FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, TEXT_GRAY));
            disclaimer.setAlignment(Element.ALIGN_CENTER);
            disclaimer.setSpacingBefore(5);
            document.add(disclaimer);

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

        descCell.setPadding(4);
        earningsCell.setPadding(4);
        deductionsCell.setPadding(4);

        table.addCell(descCell);
        table.addCell(earningsCell);
        table.addCell(deductionsCell);
    }

    private void addEmployeeInfoRow(PdfPTable table, String label1, String value1, String label2, String value2, Font boldFont, Font regularFont) {
        PdfPCell labelCell1 = new PdfPCell(new Phrase(label1, boldFont));
        labelCell1.setBorder(Rectangle.NO_BORDER);
        labelCell1.setPadding(6);
        labelCell1.setBackgroundColor(LIGHT_GRAY);
        
        PdfPCell valueCell1 = new PdfPCell(new Phrase(value1, regularFont));
        valueCell1.setBorder(Rectangle.NO_BORDER);
        valueCell1.setPadding(6);
        
        PdfPCell labelCell2 = new PdfPCell(new Phrase(label2, boldFont));
        labelCell2.setBorder(Rectangle.NO_BORDER);
        labelCell2.setPadding(6);
        labelCell2.setBackgroundColor(LIGHT_GRAY);
        
        PdfPCell valueCell2 = new PdfPCell(new Phrase(value2, regularFont));
        valueCell2.setBorder(Rectangle.NO_BORDER);
        valueCell2.setPadding(6);
        
        table.addCell(labelCell1);
        table.addCell(valueCell1);
        table.addCell(labelCell2);
        table.addCell(valueCell2);
    }

    private void addProfessionalHeaderCell(PdfPTable table, String text, BaseColor backgroundColor, BaseColor textColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, textColor)));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBackgroundColor(backgroundColor);
        cell.setPadding(8);
        cell.setBorder(Rectangle.NO_BORDER);
        table.addCell(cell);
    }

    private void addStyledSalaryRow(PdfPTable table, String description, BigDecimal earnings, BigDecimal deductions, 
            BaseColor backgroundColor, Font font) {
        PdfPCell descCell = new PdfPCell(new Phrase(description, font));
        descCell.setPadding(6);
        descCell.setBackgroundColor(backgroundColor);
        descCell.setBorder(Rectangle.NO_BORDER);
        
        PdfPCell earningsCell = new PdfPCell(new Phrase(earnings != null ? "₹" + formatAmount(earnings) : "-", font));
        earningsCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        earningsCell.setPadding(6);
        earningsCell.setBackgroundColor(backgroundColor);
        earningsCell.setBorder(Rectangle.NO_BORDER);
        
        PdfPCell deductionsCell = new PdfPCell(new Phrase(deductions != null ? "₹" + formatAmount(deductions) : "-", font));
        deductionsCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        deductionsCell.setPadding(6);
        deductionsCell.setBackgroundColor(backgroundColor);
        deductionsCell.setBorder(Rectangle.NO_BORDER);
        
        table.addCell(descCell);
        table.addCell(earningsCell);
        table.addCell(deductionsCell);
    }

    private void addTotalRow(PdfPTable table, String label, BigDecimal amount, BaseColor backgroundColor, BaseColor textColor) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, textColor)));
        labelCell.setPadding(8);
        labelCell.setBackgroundColor(backgroundColor);
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        
        PdfPCell amountCell = new PdfPCell(new Phrase("₹" + formatAmount(amount), 
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, textColor)));
        amountCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        amountCell.setPadding(8);
        amountCell.setBackgroundColor(backgroundColor);
        amountCell.setBorder(Rectangle.NO_BORDER);
        
        PdfPCell emptyCell = new PdfPCell(new Phrase("", FontFactory.getFont(FontFactory.HELVETICA, 12)));
        emptyCell.setPadding(12);
        emptyCell.setBackgroundColor(backgroundColor);
        emptyCell.setBorder(Rectangle.NO_BORDER);
        
        table.addCell(labelCell);
        table.addCell(amountCell);
        table.addCell(emptyCell);
    }

    private String formatAmount(BigDecimal amount) {
        if (amount == null) return "0.00";
        return String.format("%.2f", amount);
    }
}