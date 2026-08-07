package com.example.trello.controller;

import com.example.trello.repository.CardRepository;
import com.example.trello.repository.ColumnRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CardController.class)
class CardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CardRepository cardRepository;

    @MockitoBean
    private ColumnRepository columnRepository;

    @Test
    void getCards_withInvalidPriority_returnsBadRequestInsteadOfServerError() throws Exception {
        when(cardRepository.findAllByOrderByOrderAsc()).thenReturn(List.of());

        mockMvc.perform(get("/api/cards").param("priority", "urgent"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteCard_withUnknownId_returnsNotFound() throws Exception {
        when(cardRepository.existsById("missing-id")).thenReturn(false);

        mockMvc.perform(delete("/api/cards/missing-id"))
                .andExpect(status().isNotFound());
    }
}
