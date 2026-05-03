package com.invoicepro.controller;

import com.invoicepro.dto.request.CustomerRequest;
import com.invoicepro.dto.response.CustomerResponse;
import com.invoicepro.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    public ResponseEntity<CustomerResponse> createCustomer(@Valid @RequestBody CustomerRequest request,
                                                           @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(customerService.createCustomer(request, userDetails.getUsername()));
    }

    @GetMapping
    public ResponseEntity<List<CustomerResponse>> getAllCustomers(@RequestParam(required = false) String search,
                                                                  @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(customerService.getAllCustomers(userDetails.getUsername(), search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable Long id,
                                                            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(customerService.getCustomerById(id, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> updateCustomer(@PathVariable Long id,
                                                           @Valid @RequestBody CustomerRequest request,
                                                           @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(customerService.updateCustomer(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        customerService.deleteCustomer(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
