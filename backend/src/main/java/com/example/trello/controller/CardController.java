package com.example.trello.controller;

import com.example.trello.dto.CardRequest;
import com.example.trello.entity.BoardColumn;
import com.example.trello.entity.Card;
import com.example.trello.entity.Priority;
import com.example.trello.repository.CardRepository;
import com.example.trello.repository.ColumnRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    private final CardRepository cardRepository;
    private final ColumnRepository columnRepository;

    public CardController(CardRepository cardRepository, ColumnRepository columnRepository) {
        this.cardRepository = cardRepository;
        this.columnRepository = columnRepository;
    }

    @GetMapping
    public List<Card> getCards(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String columnId
    ) {
        List<Card> cards = cardRepository.findAllByOrderByOrderAsc();

        if (keyword != null && !keyword.isBlank()) {
            String lowerKeyword = keyword.toLowerCase(Locale.ROOT);
            cards = cards.stream()
                    .filter(c -> containsIgnoreCase(c.getTitle(), lowerKeyword)
                            || containsIgnoreCase(c.getDescription(), lowerKeyword))
                    .toList();
        }

        if (priority != null && !priority.isBlank()) {
            Priority priorityValue = Priority.fromValue(priority);
            cards = cards.stream().filter(c -> c.getPriority() == priorityValue).toList();
        }

        if (columnId != null && !columnId.isBlank()) {
            cards = cards.stream().filter(c -> columnId.equals(c.getColumnId())).toList();
        }

        return cards;
    }

    private boolean containsIgnoreCase(String value, String lowerKeyword) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(lowerKeyword);
    }

    @PostMapping
    public ResponseEntity<Card> createCard(@Valid @RequestBody CardRequest request) {
        Card card = new Card();
        applyRequest(card, request);
        Card saved = cardRepository.save(card);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Card> updateCard(@PathVariable String id, @Valid @RequestBody CardRequest request) {
        Card card = cardRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "card not found: " + id));
        applyRequest(card, request);
        return ResponseEntity.ok(cardRepository.save(card));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCard(@PathVariable String id) {
        if (!cardRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        cardRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void applyRequest(Card card, CardRequest request) {
        BoardColumn column = columnRepository.findById(request.getColumnId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid columnId: " + request.getColumnId()));

        card.setTitle(request.getTitle());
        card.setDescription(request.getDescription());
        card.setPriority(request.getPriority() != null ? Priority.fromValue(request.getPriority()) : Priority.MEDIUM);
        card.setDueDate(request.getDueDate());
        card.setColumn(column);
        card.setOrder(request.getOrder() != null ? request.getOrder() : 0);
    }
}
