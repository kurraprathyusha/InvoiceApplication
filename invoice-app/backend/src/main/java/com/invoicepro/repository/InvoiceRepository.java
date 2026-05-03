package com.invoicepro.repository;

import com.invoicepro.entity.Invoice;
import com.invoicepro.entity.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    @Query("SELECT MAX(CAST(SUBSTRING(i.invoiceNumber, 10) AS int)) FROM Invoice i WHERE i.invoiceNumber LIKE CONCAT('INV-', :year, '-%')")
    Optional<Integer> findMaxSequenceForYear(@Param("year") int year);

    @Query("SELECT i FROM Invoice i WHERE i.user.id = :userId AND " +
           "(:status IS NULL OR i.status = :status) AND " +
           "(:customerId IS NULL OR i.customer.id = :customerId) AND " +
           "(:search IS NULL OR LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(i.customer.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Invoice> findAllWithFilters(@Param("userId") Long userId, @Param("status") InvoiceStatus status, @Param("customerId") Long customerId, @Param("search") String search, Pageable pageable);

    long countByUserId(Long userId);

    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.user.id = :userId AND i.status = :status")
    BigDecimal sumTotalAmountByUserIdAndStatus(@Param("userId") Long userId, @Param("status") InvoiceStatus status);

    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.user.id = :userId AND i.status IN :statuses")
    BigDecimal sumTotalAmountByUserIdAndStatuses(@Param("userId") Long userId, @Param("statuses") List<InvoiceStatus> statuses);

    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.user.id = :userId AND i.status = :status AND i.invoiceDate >= :start AND i.invoiceDate <= :end")
    BigDecimal sumTotalAmountByUserIdAndStatusAndDateRange(@Param("userId") Long userId, @Param("status") InvoiceStatus status, @Param("start") java.time.LocalDate start, @Param("end") java.time.LocalDate end);

    @Query("SELECT i.status, COUNT(i) FROM Invoice i WHERE i.user.id = :userId GROUP BY i.status")
    List<Object[]> countByUserIdGroupByStatus(@Param("userId") Long userId);
}
