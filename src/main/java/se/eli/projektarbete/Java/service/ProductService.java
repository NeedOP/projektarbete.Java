package se.eli.projektarbete.Java.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import se.eli.projektarbete.Java.repository.ProductRepository;
import se.eli.projektarbete.Java.entity.Product;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    ProductRepository productRepository;

    public Product save(Product p) {
        return productRepository.save(p);
    }

    public List<Product> listAll() {
        return productRepository.findAll();
    }

    public Product get(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }
}