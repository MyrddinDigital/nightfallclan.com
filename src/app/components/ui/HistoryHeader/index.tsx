import styles from "./HistoryHeader.module.scss";

export default function HistoryHeader() {
  return (
    <div className={styles.header}>
      <span className={styles.left}>
        <h1 className={styles.title}>A Brief History of Nightfall Clan</h1>
        <span className={styles.meta}>
          Written by{" "}
          <a target="_blank" rel="noopener noreferrer" href="https://www.roblox.com/users/6070434/profile">
            MertesX
          </a>
          , edited by{" "}
          <a target="_blank" rel="noopener noreferrer" href="https://www.roblox.com/users/2983178/profile">
            Thelegender
          </a>
        </span>
        <span className={styles.meta}>Last updated May 4, 2025</span>
      </span>
      <span className={styles.right}>
        <a
          target="_blank"
          rel="noopener noreferrer"
          title="NFC on Roblox"
          href="https://www.roblox.com/communities/85654/Nightfall-Clan"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.logo} src="/logo.png" alt="Nightfall Clan logo" />
        </a>
      </span>
    </div>
  );
}
