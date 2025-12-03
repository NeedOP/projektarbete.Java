package se.eli.projektarbete.Java.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import se.eli.projektarbete.Java.service.OrderService;
import se.eli.projektarbete.Java.dto.CheckoutDto;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import se.eli.projektarbete.Java.entity.OrderEntity;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    OrderService orderService;

    @PostMapping("/checkout")
    public OrderEntity checkout(@AuthenticationPrincipal UserDetails ud, @Valid @RequestBody CheckoutDto dto) {
        return orderService.createOrder(ud.getUsername(), dto);
    }

    @GetMapping("/me")
    public List<OrderEntity> myOrders(@AuthenticationPrincipal UserDetails ud) {
        return orderService.getOrdersForUser(ud.getUsername());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<OrderEntity> allOrders() {
        return orderService.getAllOrders();
    }
}
