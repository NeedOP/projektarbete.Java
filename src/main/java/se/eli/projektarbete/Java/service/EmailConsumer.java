package se.eli.projektarbete.Java.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
public class EmailConsumer {

    // Change "emailQueue" to "email-queue" (with hyphen)
    @RabbitListener(queues = "email-queue")  // ← FIX THIS LINE!
    public void receiveEmailMessage(Map<String, String> message) {
        String to = message.get("to");
        String subject = message.get("subject");
        String body = message.get("body");

        log.info("📧 EMAIL WOULD BE SENT TO: {}", to);
        log.info("📧 SUBJECT: {}", subject);
        log.info("📧 BODY: {}", body);
        log.info("📧 --- Email sent successfully ---");
    }
}