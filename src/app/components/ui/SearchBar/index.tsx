"use client";

import { SearchIcon } from "@icons";
import { useSearch } from "@context/SearchContext";
import styles from "./SearchBar.module.scss";

export default function SearchBar() {
  const { inputValue, setInputValue, setLoading } = useSearch();

  function handleClear() {
    setInputValue("");
    setLoading(true);
    window.scrollTo(0, 0);
    setTimeout(() => setLoading(false), 100);
    document.getElementById("search-posts")?.focus();
  }

  return (
    <div className={styles.inputWrapper}>
      <SearchIcon className={styles.searchIcon} />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search"
        id="search-posts"
      />
      {inputValue && (
        <button className={styles.clearButton} onClick={handleClear}>
          &times;
        </button>
      )}
    </div>
  );
}
