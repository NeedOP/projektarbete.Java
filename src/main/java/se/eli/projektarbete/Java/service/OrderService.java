package se.eli.projektarbete.Java.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import se.eli.projektarbete.Java.repository.OrderRepository;
import se.eli.projektarbete.Java.repository.ProductRepository;
import se.eli.projektarbete.Java.repository.UserRepository;
import se.eli.projektarbete.Java.entity.*;
import se.eli.projektarbete.Java.dto.CheckoutDto;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {
    @Autowired
    OrderRepository orderRepository;
    @Autowired
    ProductRepository productRepository;
    @Autowired
    UserRepository userRepository;

    public OrderEntity createOrder(String username, CheckoutDto checkout) {
        var user = userRepository.findByUsername(username).orElseThrow();
        List<OrderItem> items = new ArrayList<>();
        double total = 0.0;
        for (var it : checkout.getItems()) {
            Product p = productRepository.findById(it.getProductId()).orElseThrow();
            if (p.getStock() < it.getQuantity()) {
                throw new RuntimeException("Not enough stock for product " + p.getName());
            }
            p.setStock(p.getStock() - it.getQuantity());
            productRepository.save(p);

            OrderItem oi = new OrderItem();
            oi.setProductId(p.getId());
            oi.setPrice(p.getPrice());
            oi.setQuantity(it.getQuantity());
            oi.setProductName(p.getName());
            items.add(oi);
            total += p.getPrice() * it.getQuantity();
        }
        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setItems(items);
        order.setTotal(total);
        return orderRepository.save(order);
    }

    public List<OrderEntity> getOrdersForUser(String username) {
        var u = userRepository.findByUsername(username).orElseThrow();
        return orderRepository.findByUserId(u.getId());
    }

    public List<OrderEntity> getAllOrders() {
        return orderRepository.findAll();
    }
}
