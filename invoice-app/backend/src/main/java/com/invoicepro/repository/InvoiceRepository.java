package com.invoicepro.repository;

import com.invoicepro.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    
    @Query("SELECT MAX(CAST(SUBSTRING(i.invoiceNumber, 10) AS int)) FROM Invoice i WHERE i.invoiceNumber LIKE CONCAT('INV-', :year, '-%')")
    Optional<Integer> findMaxSequenceForYear(@Param("year") int year);

    @Query("SELECT i FROM Invoice i WHERE i.user.id = :userId AND " +
           "(:status IS NULL OR i.status = :status) AND " +
           "(:customerId IS NULL OR i.customer.id = :customerId) AND " +
           "(:search IS NULL OR LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(i.customer.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Invoice> findAllWithFilters(@Param("userId") Long userId, @Param("status") String status, @Param("customerId") Long customerId, @Param("search") String search, Pageable pageable);
}
