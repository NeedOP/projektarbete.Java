package se.eli.projektarbete.Java.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import se.eli.projektarbete.Java.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
