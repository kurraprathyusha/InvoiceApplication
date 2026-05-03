package com.invoicepro.service;

import com.invoicepro.dto.request.InvoiceItemRequest;
import com.invoicepro.dto.request.InvoiceRequest;
import com.invoicepro.dto.response.CustomerResponse;
import com.invoicepro.dto.response.InvoiceItemResponse;
import com.invoicepro.dto.response.InvoiceResponse;
import com.invoicepro.entity.Customer;
import com.invoicepro.entity.Invoice;
import com.invoicepro.entity.InvoiceItem;
import com.invoicepro.entity.InvoiceStatus;
import com.invoicepro.entity.User;
import com.invoicepro.exception.BadRequestException;
import com.invoicepro.exception.ResourceNotFoundException;
import com.invoicepro.repository.CustomerRepository;
import com.invoicepro.repository.InvoiceRepository;
import com.invoicepro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    @Transactional
    public synchronized InvoiceResponse createInvoice(InvoiceRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (!customer.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Customer not found");
        }

        if (request.getDueDate().isBefore(request.getInvoiceDate())) {
            throw new BadRequestException("Due date cannot be before invoice date");
        }

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setCustomer(customer);
        invoice.setUser(user);
        invoice.setInvoiceDate(request.getInvoiceDate());
        invoice.setDueDate(request.getDueDate());
        invoice.setStatus(request.getStatus());
        invoice.setNotes(request.getNotes());

        calculateAndSetTotals(invoice, request.getItems());

        return mapToResponse(invoiceRepository.save(invoice));
    }

    public Page<InvoiceResponse> getInvoices(String statusStr, Long customerId, String search, Pageable pageable, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Page<Invoice> invoices = invoiceRepository.findAllWithFilters(user.getId(), statusStr, customerId, search, pageable);
        return invoices.map(this::mapToResponse);
    }

    public InvoiceResponse getInvoiceById(Long id, String userEmail) {
        return mapToResponse(getInvoiceOwnedByUser(id, userEmail));
    }

    @Transactional
    public InvoiceResponse updateInvoice(Long id, InvoiceRequest request, String userEmail) {
        Invoice invoice = getInvoiceOwnedByUser(id, userEmail);

        if (request.getDueDate().isBefore(request.getInvoiceDate())) {
            throw new BadRequestException("Due date cannot be before invoice date");
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        
        if (!customer.getUser().getEmail().equals(userEmail)) {
            throw new ResourceNotFoundException("Customer not found");
        }

        invoice.setCustomer(customer);
        invoice.setInvoiceDate(request.getInvoiceDate());
        invoice.setDueDate(request.getDueDate());
        invoice.setStatus(request.getStatus());
        invoice.setNotes(request.getNotes());

        // Clear existing items and calculate new totals
        invoice.getItems().clear();
        calculateAndSetTotals(invoice, request.getItems());

        return mapToResponse(invoiceRepository.save(invoice));
    }

    public void deleteInvoice(Long id, String userEmail) {
        Invoice invoice = getInvoiceOwnedByUser(id, userEmail);
        invoiceRepository.delete(invoice);
    }

    public InvoiceResponse updateInvoiceStatus(Long id, InvoiceStatus status, String userEmail) {
        Invoice invoice = getInvoiceOwnedByUser(id, userEmail);
        invoice.setStatus(status);
        return mapToResponse(invoiceRepository.save(invoice));
    }

    private Invoice getInvoiceOwnedByUser(Long id, String userEmail) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        if (!invoice.getUser().getEmail().equals(userEmail)) {
            throw new ResourceNotFoundException("Invoice not found");
        }
        return invoice;
    }

    private String generateInvoiceNumber() {
        int currentYear = LocalDate.now().getYear();
        Integer maxSeq = invoiceRepository.findMaxSequenceForYear(currentYear).orElse(0);
        return String.format("INV-%d-%04d", currentYear, maxSeq + 1);
    }

    private void calculateAndSetTotals(Invoice invoice, List<InvoiceItemRequest> itemRequests) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal taxAmount = BigDecimal.ZERO;

        for (InvoiceItemRequest itemReq : itemRequests) {
            InvoiceItem item = new InvoiceItem();
            item.setInvoice(invoice);
            item.setName(itemReq.getName());
            item.setDescription(itemReq.getDescription());
            item.setQuantity(itemReq.getQuantity());
            item.setPrice(itemReq.getPrice().setScale(2, RoundingMode.HALF_UP));
            item.setTaxPercent(itemReq.getTaxPercent().setScale(2, RoundingMode.HALF_UP));

            BigDecimal lineSubtotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            BigDecimal lineTax = lineSubtotal.multiply(item.getTaxPercent()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal lineTotal = lineSubtotal.add(lineTax).setScale(2, RoundingMode.HALF_UP);

            item.setLineTotal(lineTotal);
            invoice.getItems().add(item);

            subtotal = subtotal.add(lineSubtotal);
            taxAmount = taxAmount.add(lineTax);
        }

        invoice.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
        invoice.setTaxAmount(taxAmount.setScale(2, RoundingMode.HALF_UP));
        invoice.setTotalAmount(subtotal.add(taxAmount).setScale(2, RoundingMode.HALF_UP));
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        CustomerResponse customerResponse = CustomerResponse.builder()
                .id(invoice.getCustomer().getId())
                .name(invoice.getCustomer().getName())
                .email(invoice.getCustomer().getEmail())
                .phone(invoice.getCustomer().getPhone())
                .address(invoice.getCustomer().getAddress())
                .gstNumber(invoice.getCustomer().getGstNumber())
                .build();

        List<InvoiceItemResponse> itemResponses = invoice.getItems().stream()
                .map(item -> InvoiceItemResponse.builder()
                        .id(item.getId())
                        .name(item.getName())
                        .description(item.getDescription())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .taxPercent(item.getTaxPercent())
                        .lineTotal(item.getLineTotal())
                        .build())
                .collect(Collectors.toList());

        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .customer(customerResponse)
                .invoiceDate(invoice.getInvoiceDate())
                .dueDate(invoice.getDueDate())
                .status(invoice.getStatus())
                .subtotal(invoice.getSubtotal())
                .taxAmount(invoice.getTaxAmount())
                .totalAmount(invoice.getTotalAmount())
                .notes(invoice.getNotes())
                .items(itemResponses)
                .createdAt(invoice.getCreatedAt())
                .updatedAt(invoice.getUpdatedAt())
                .build();
    }
}
