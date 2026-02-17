package com.sundar.ecommerce.repository;

import com.sundar.ecommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // JpaRepository already provides all CRUD methods:
    // save(), findAll(), findById(), deleteById(), etc.
}
