package se.eli.projektarbete.Java.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import se.eli.projektarbete.Java.entity.Product;
import se.eli.projektarbete.Java.repository.ProductRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    // ADD THIS METHOD!
    public List<Product> getAllProducts() {
        log.info("Getting all products");
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        log.info("Getting product by ID: {}", id);
        return productRepository.findById(id);
    }

    public Product createProduct(Product product) {
        log.info("Creating product: {}", product.getName());
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product productDetails) {
        log.info("Updating product ID: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setStock(productDetails.getStock());

        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        log.info("Deleting product ID: {}", id);
        productRepository.deleteById(id);
    }
}