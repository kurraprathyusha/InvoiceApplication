package com.invoicepro.service;

import com.invoicepro.dto.request.CustomerRequest;
import com.invoicepro.dto.response.CustomerResponse;
import com.invoicepro.entity.Customer;
import com.invoicepro.entity.User;
import com.invoicepro.exception.BadRequestException;
import com.invoicepro.exception.ResourceNotFoundException;
import com.invoicepro.repository.CustomerRepository;
import com.invoicepro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public CustomerResponse createCustomer(CustomerRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setGstNumber(request.getGstNumber());
        customer.setUser(user);

        return mapToResponse(customerRepository.save(customer));
    }

    public List<CustomerResponse> getAllCustomers(String userEmail, String search) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Customer> customers = customerRepository.findByUserId(user.getId());

        if (search != null && !search.trim().isEmpty()) {
            String lowerSearch = search.toLowerCase();
            customers = customers.stream()
                    .filter(c -> c.getName().toLowerCase().contains(lowerSearch) ||
                                 c.getEmail().toLowerCase().contains(lowerSearch))
                    .collect(Collectors.toList());
        }

        return customers.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public CustomerResponse getCustomerById(Long id, String userEmail) {
        Customer customer = getCustomerOwnedByUser(id, userEmail);
        return mapToResponse(customer);
    }

    public CustomerResponse updateCustomer(Long id, CustomerRequest request, String userEmail) {
        Customer customer = getCustomerOwnedByUser(id, userEmail);

        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setGstNumber(request.getGstNumber());

        return mapToResponse(customerRepository.save(customer));
    }

    public void deleteCustomer(Long id, String userEmail) {
        Customer customer = getCustomerOwnedByUser(id, userEmail);
        try {
            customerRepository.delete(customer);
        } catch (Exception e) {
            throw new BadRequestException("Cannot delete customer with existing invoices.");
        }
    }

    private Customer getCustomerOwnedByUser(Long customerId, String userEmail) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (!customer.getUser().getEmail().equals(userEmail)) {
            throw new ResourceNotFoundException("Customer not found"); // Prevents enumeration
        }

        return customer;
    }

    private CustomerResponse mapToResponse(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .address(customer.getAddress())
                .gstNumber(customer.getGstNumber())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }
}
