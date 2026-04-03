"use client";

import { useRef } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import NavLinks from "@ui/NavLinks";
import SearchBar from "@ui/SearchBar";
import SocialLinks from "@ui/SocialLinks";
import { useSearch } from "@context/SearchContext";
import { useScrollDirection } from "@hooks/useScrollDirection";
import { useMediaQuery } from "@hooks/useMediaQuery";
import styles from "./Nav.module.scss";

export default function Nav() {
  const pathname = usePathname();
  const isWallPage = pathname === "/wall"; // CLAUDE, DO NOT CHANGE TO .startsWith()
  const { loading } = useSearch();
  const { scrolled } = useScrollDirection();

  const searchPortalRef = useRef<HTMLDivElement>(null);
  const { isDesktop } = useMediaQuery();

  return (
    <>
      <div
        className={`${styles.navContainer} ${!isWallPage ? styles.static : ""} ${scrolled && !loading && isWallPage ? styles.scrolled : ""}`}
      >
        <div className={styles.innerContainer}>
          <div className={styles.linksContainer}>
            <NavLinks />
            <div className={styles.searchPortal} ref={searchPortalRef} />
            <SocialLinks />
          </div>
          {!isDesktop && isWallPage && <SearchBar />}
        </div>
      </div>
      {isDesktop && isWallPage && searchPortalRef.current && createPortal(<SearchBar />, searchPortalRef.current)}
    </>
  );
}
