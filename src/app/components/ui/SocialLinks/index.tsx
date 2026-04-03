import { GitHubIcon, RobloxIcon, DiscordIcon } from "@icons";
import styles from "./SocialLinks.module.scss";

export default function SocialLinks() {
  return (
    <div className={styles.socialLinks}>
      <a
        className={styles.discordLink}
        title="Veterans server"
        href="https://discord.com/invite/QHpxqMB"
        target="_blank"
        rel="noopener noreferrer"
      >
        <DiscordIcon className={styles.icon} />
      </a>
      <a
        className={styles.githubLink}
        title="GitHub repo"
        href="https://github.com/MyrddinDigital/nightfallclan.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        <GitHubIcon className={styles.icon} />
      </a>
      <a
        className={styles.robloxLink}
        title="Veterans group"
        href="https://www.roblox.com/communities/1126206/Nightfall-Clan-Veterans"
        target="_blank"
        rel="noopener noreferrer"
      >
        <RobloxIcon className={styles.icon} />
      </a>
    </div>
  );
}
