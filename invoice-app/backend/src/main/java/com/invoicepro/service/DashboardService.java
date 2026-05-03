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
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Long userId = user.getId();

        long totalCustomers = customerRepository.countByUserId(userId);
        long totalInvoices = invoiceRepository.countByUserId(userId);

        BigDecimal totalRevenue = invoiceRepository.sumTotalAmountByUserIdAndStatus(userId, InvoiceStatus.PAID);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        BigDecimal pendingAmount = invoiceRepository.sumTotalAmountByUserIdAndStatuses(userId,
                List.of(InvoiceStatus.UNPAID, InvoiceStatus.PENDING));
        if (pendingAmount == null) pendingAmount = BigDecimal.ZERO;

        List<InvoiceResponse> recentInvoices = invoiceRepository.findAllWithFilters(userId, null, null, null,
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "invoiceDate"))).map(this::mapToResponse).getContent();

        // Calculate Revenue by Month (last 6 months) using targeted queries
        List<DashboardStatsResponse.MonthlyRevenue> revenueByMonth = new ArrayList<>();
        LocalDate now = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");

        for (int i = 5; i >= 0; i--) {
            LocalDate monthStart = now.minusMonths(i).withDayOfMonth(1);
            LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);

            BigDecimal monthRev = invoiceRepository.sumTotalAmountByUserIdAndStatusAndDateRange(
                    userId, InvoiceStatus.PAID, monthStart, monthEnd);
            if (monthRev == null) monthRev = BigDecimal.ZERO;

            revenueByMonth.add(DashboardStatsResponse.MonthlyRevenue.builder()
                    .month(monthStart.format(formatter))
                    .revenue(monthRev)
                    .build());
        }

        // Calculate Status Distribution using a group-by query
        Map<InvoiceStatus, Long> statusCounts = invoiceRepository.countByUserIdGroupByStatus(userId).stream()
                .collect(Collectors.toMap(
                        row -> (InvoiceStatus) row[0],
                        row -> (Long) row[1]
                ));

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
