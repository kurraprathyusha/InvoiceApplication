package com.invoicepro.service;

import com.invoicepro.dto.response.DashboardStatsResponse;
import com.invoicepro.dto.response.InvoiceResponse;
import com.invoicepro.entity.Invoice;
import com.invoicepro.entity.InvoiceStatus;
import com.invoicepro.entity.User;
import com.invoicepro.exception.ResourceNotFoundException;
import com.invoicepro.repository.CustomerRepository;
import com.invoicepro.repository.InvoiceRepository;
import com.invoicepro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public DashboardStatsResponse getDashboardStats(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Long userId = user.getId();

        List<Invoice> allInvoices = invoiceRepository.findAllWithFilters(userId, null, null, null, PageRequest.of(0, 10000)).getContent();
        
        long totalCustomers = customerRepository.findByUserId(userId).size();
        long totalInvoices = allInvoices.size();

        BigDecimal totalRevenue = allInvoices.stream()
                .filter(i -> i.getStatus() == InvoiceStatus.PAID)
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal pendingAmount = allInvoices.stream()
                .filter(i -> i.getStatus() == InvoiceStatus.UNPAID || i.getStatus() == InvoiceStatus.PENDING)
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<InvoiceResponse> recentInvoices = invoiceRepository.findAllWithFilters(userId, null, null, null, 
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "invoiceDate"))).map(this::mapToResponse).getContent();

        // Calculate Revenue by Month (last 6 months)
        List<DashboardStatsResponse.MonthlyRevenue> revenueByMonth = new ArrayList<>();
        LocalDate now = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");
        
        for (int i = 5; i >= 0; i--) {
            LocalDate monthStart = now.minusMonths(i).withDayOfMonth(1);
            LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
            
            BigDecimal monthRev = allInvoices.stream()
                    .filter(inv -> inv.getStatus() == InvoiceStatus.PAID)
                    .filter(inv -> !inv.getInvoiceDate().isBefore(monthStart) && !inv.getInvoiceDate().isAfter(monthEnd))
                    .map(Invoice::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
            revenueByMonth.add(DashboardStatsResponse.MonthlyRevenue.builder()
                    .month(monthStart.format(formatter))
                    .revenue(monthRev)
                    .build());
        }

        // Calculate Status Distribution
        Map<InvoiceStatus, Long> statusCounts = allInvoices.stream()
                .collect(Collectors.groupingBy(Invoice::getStatus, Collectors.counting()));
                
        List<DashboardStatsResponse.StatusDistribution> statusDistribution = Arrays.stream(InvoiceStatus.values())
                .map(status -> DashboardStatsResponse.StatusDistribution.builder()
                        .status(status.name())
                        .count(statusCounts.getOrDefault(status, 0L))
                        .build())
                .collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .totalInvoices(totalInvoices)
                .totalRevenue(totalRevenue)
                .pendingAmount(pendingAmount)
                .totalCustomers(totalCustomers)
                .recentInvoices(recentInvoices)
                .revenueByMonth(revenueByMonth)
                .statusDistribution(statusDistribution)
                .build();
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .invoiceDate(invoice.getInvoiceDate())
                .dueDate(invoice.getDueDate())
                .status(invoice.getStatus())
                .totalAmount(invoice.getTotalAmount())
                .customer(com.invoicepro.dto.response.CustomerResponse.builder().name(invoice.getCustomer().getName()).build())
                .build();
    }
}
