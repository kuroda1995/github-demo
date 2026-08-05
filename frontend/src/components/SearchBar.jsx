import { useEffect, useState } from "react";
import { PRIORITIES } from "../constants";

const DEBOUNCE_MS = 300;

export function SearchBar({ onSearch }) {
  const [keyword, setKeyword] = useState("");
  const [priority, setPriority] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch({ keyword: keyword.trim(), priority });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [keyword, priority, onSearch]);

  function handleReset() {
    setKeyword("");
    setPriority("");
  }

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="キーワードで検索(タイトル・説明)"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <select
        className="search-priority"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option value="">優先度: 指定なし</option>
        {PRIORITIES.map((p) => (
          <option key={p.value} value={p.value}>
            {"優先度: " + p.label}
          </option>
        ))}
      </select>
      {(keyword || priority) && (
        <button type="button" className="search-clear" onClick={handleReset}>
          クリア
        </button>
      )}
    </div>
  );
}
