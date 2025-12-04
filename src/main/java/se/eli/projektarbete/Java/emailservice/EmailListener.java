package se.eli.projektarbete.Java.emailservice;


import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class EmailListener {
    @RabbitListener(queues = "email-queue")
    public void onUserRegistered(String username) {
        System.out.println("[email-service] send email to " + username + " (simulated)");
    }
}
