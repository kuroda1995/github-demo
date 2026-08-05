package com.example.trello.controller;

import com.example.trello.entity.BoardColumn;
import com.example.trello.repository.ColumnRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/columns")
public class ColumnController {

    private final ColumnRepository columnRepository;

    public ColumnController(ColumnRepository columnRepository) {
        this.columnRepository = columnRepository;
    }

    @GetMapping
    public List<BoardColumn> getColumns() {
        return columnRepository.findAllByOrderByOrderAsc();
    }
}
