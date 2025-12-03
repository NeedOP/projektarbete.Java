package se.eli.projektarbete.Java.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import se.eli.projektarbete.Java.service.ProductService;
import se.eli.projektarbete.Java.entity.Product;
import se.eli.projektarbete.Java.dto.ProductDto;
import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired
    ProductService productService;

    @GetMapping
    public List<Product> list() {
        return productService.listAll();
    }

    @GetMapping("/{id}")
    public Product get(@PathVariable Long id) {
        return productService.get(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Product create(@Valid @RequestBody ProductDto dto) {
        Product p = new Product();
        p.setName(dto.getName());
        p.setDescription(dto.getDescription());
        p.setPrice(dto.getPrice());
        p.setStock(dto.getStock() == null ? 0 : dto.getStock());
        return productService.save(p);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

