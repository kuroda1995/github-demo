package com.example.trello.repository;

import com.example.trello.entity.BoardColumn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ColumnRepository extends JpaRepository<BoardColumn, String> {
    List<BoardColumn> findAllByOrderByOrderAsc();
}
