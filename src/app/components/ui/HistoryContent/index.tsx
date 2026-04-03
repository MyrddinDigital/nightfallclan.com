"use client";

import { useEffect } from "react";
import styles from "./HistoryContent.module.scss";

export default function HistoryContent() {
  useEffect(() => {
    const headers = document.querySelectorAll<HTMLElement>(
      `[data-history-header]`
    );
    const headerHeight = headers[0]?.offsetHeight || 46;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      let activeHeaderIndex = -1;

      headers.forEach((header, index) => {
        const headerTop = header.offsetTop;
        const trueTop = header.getBoundingClientRect().top;
        const triggerPoint = scrollPosition + headerHeight;

        if (headerTop > triggerPoint) {
          header.classList.remove(styles.sticky);
        } else {
          header.classList.add(styles.sticky);
          activeHeaderIndex = Math.max(activeHeaderIndex, index);
        }

        if (trueTop === 0) {
          header.classList.add(styles.stuck);
        } else if (trueTop > 80) {
          header.classList.remove(styles.stuck);
        }
      });

      headers.forEach((header, index) => {
        header.style.transform =
          index < activeHeaderIndex ? "translateY(-100%)" : "";
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={styles.content}>
      <h2 data-history-header id="foundation-and-early-development">
        Foundation and Early Development{" "}
        <span className={styles.yearRange}>(2010–2011)</span>
      </h2>
      <p>
        In the dynamic and fiercely competitive clan world of 2010,{" "}
        <b>Nightfall Clan (NFC)</b> emerged as a formidable new entity. Founded
        on March 6 by{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/users/785045/profile"
        >
          Soccerpr89
        </a>
        , a former high-ranking member of the{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/groups/18"
        >
          United Clan of ROBLOX (UCR)
        </a>
        , NFC quickly distinguished itself, amassing 1,000 members in a
        remarkably short period. This rapid growth signaled the clan&apos;s
        potential in a landscape where loyalty and strategy were paramount.
        <br />
        <br />
        However, Soccerpr89&apos;s early departure from leadership left a
        vacuum, igniting a two-week power struggle that tested the fledgling
        clan&apos;s resilience. The dispute, involving Vince13579,{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/users/648020/profile"
        >
          trick555
        </a>
        , and dboot98, underscored the fragility of leadership in such a
        competitive environment. Vince13579 was granted temporary ownership and
        proved to be an effective leader, growing NFC by investing profits from
        his game into strategic advertisements.
        <br />
        <br />
        Eventually, Soccerpr89 demanded the group&apos;s ownership be returned.
        Vince complied, and less than three months later, Soccerpr89 transferred
        ownership to his sister,{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/users/7714875/profile"
        >
          buildXbuild
        </a>
        , as a means of safeguarding the clan&apos;s future. This transition
        marked the beginning of NFC&apos;s complex leadership journey. Under her
        stewardship, council members{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/users/9365056/profile"
        >
          Darxia
        </a>
        ,{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/users/513328/profile"
        >
          catlord5
        </a>
        , and{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/users/88373/profile"
        >
          b3njam1n
        </a>{" "}
        became the backbone of NFC, steering it through buildXbuild&apos;s
        eventual inactivity. Darxia&apos;s appointment as &ldquo;Acting
        Chancellor&rdquo; in December 2010 was a testament to his growing
        influence. Soccerpr89&apos;s third term, though brief, saw the clan
        stagnate, prompting him to relinquish ownership to Darxia in March 2011,
        with the condition of its eventual return—a decision that would shape
        NFC&apos;s future.
      </p>

      <h2 data-history-header id="reformation-and-growth">
        Reformation and Growth{" "}
        <span className={styles.yearRange}>(2011)</span>
      </h2>
      <p>
        Darxia&apos;s leadership heralded a transformative era for NFC, often
        celebrated by veterans as a golden chapter. His tenure was defined by
        bold structural reforms and rapid expansion, breathing new life into the
        clan. Yet, this period of prosperity was not without its challenges.
        Soccerpr89&apos;s return and demand for ownership threatened to unravel
        Darxia&apos;s progress. Unwilling to cede control, Darxia accepted a
        financial settlement from Soccerpr89 but refused to transfer ownership,
        a move that strained relations. In retaliation, Soccerpr89 founded{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/groups/314668/Nightfall-Army"
        >
          Nightfall Army (NFA)
        </a>
        , igniting months of intense rivalry. NFC&apos;s established strength
        and strategic acumen secured its dominance, and NFA ultimately faded into
        obscurity.
        <br />
        <br />
        In August 2011, Darxia passed the mantle to{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/users/16601274/profile"
        >
          XNoBoomX
        </a>
        , a former leader of the{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/groups/80738/Urban-Assault-Forces"
        >
          Urban Assault Forces (UAF)
        </a>
        . Though his tenure was brief, lasting only a month, XNoBoomX&apos;s
        dynamic leadership left an indelible mark, further solidifying
        NFC&apos;s reputation for adaptability and resilience.
      </p>

      <h2 data-history-header id="peak-prosperity">
        Peak Prosperity{" "}
        <span className={styles.yearRange}>(2011–2012)</span>
      </h2>
      <p>
        The appointment of{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/users/5821118/profile"
        >
          Fighters1234
        </a>{" "}
        as Chancellor in September 2011 marked the dawn of NFC&apos;s golden
        age. Under his visionary leadership, the clan experienced unprecedented
        growth, with membership surging by over 10,000 in just one year.
        Fighters achieved this growth by re-investing Robux earned from the
        clan&apos;s popular Fort Topixa into advertisements. This era of
        prosperity was fueled by a palpable sense of optimism and relentless
        activity. However, in 2012, Fighters1234&apos;s temporary delegation of
        leadership to{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/users/7626010/profile"
        >
          Fireantfive
        </a>{" "}
        for the summer proved a miscalculation. Fireantfive&apos;s ambitious
        plans faltered, and the clan&apos;s momentum waned, exacerbated by
        significant losses in a protracted conflict with{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/groups/165491/The-Robloxian-Army-TRA"
        >
          The Robloxian Army (TRA)
        </a>
        .
        <br />
        <br />
        Upon his return, Fighters1234 swiftly reclaimed leadership and,
        alongside Vice Chancellor{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/users/421796/profile"
        >
          bob104810
        </a>
        , launched Operation Green Thunder. This audacious initiative, supported
        by{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/users/13416513/profile"
        >
          Merely
        </a>
        ,{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/users/2231221/profile"
        >
          TheGamer101
        </a>
        , and others, saw substantial Robux investments pour into NFC,
        catapulting membership by an additional 2,000 in just two weeks. This
        bold move underscored the clan&apos;s strategic ingenuity and set a new
        benchmark for growth.
      </p>

      <h2 data-history-header id="decline-and-instability">
        Decline and Instability{" "}
        <span className={styles.yearRange}>(2012–2013)</span>
      </h2>
      <p>
        In November 2012, bob104810 ascended to the role of NFC&apos;s 14th
        Chancellor, inheriting a clan at the height of its influence but facing
        internal challenges. His leadership, though supported by Fireantfive,
        was inconsistent, sowing seeds of discontent. By April 2013, frustration
        boiled over as a faction of officers staged a rebellion, demanding his
        resignation. The uprising, though swiftly quashed, exposed deep fissures
        within the clan, with many dissenters demoted or expelled. This period
        of instability marked the beginning of NFC&apos;s gradual decline.
      </p>

      <h2 data-history-header id="attempts-at-revival">
        Attempts at Revival{" "}
        <span className={styles.yearRange}>(2013–2014)</span>
      </h2>
      <p>
        Fireantfive&apos;s appointment in June 2013 was met with widespread
        approval, as his theatrical leadership style—marked by impassioned
        speeches,{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.youtube.com/channel/UC7fZoPROmUxY5ig5tCMqe0w"
        >
          videos
        </a>
        , and propaganda—reignited hope for renewal. Yet, the clan&apos;s
        decline persisted, prompting Fireantfive to experiment with a
        controversial WWII-inspired motif. The initiative, met with resistance,
        was soon abandoned. Undeterred, Fireantfive pivoted to more pragmatic
        efforts, which gained traction during a war with{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/groups/372807/The-Grand-Imperium"
        >
          The Grand Imperium (TGI)
        </a>
        . Though NFC lost, the conflict galvanized the clan. A subsequent clash
        with{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/groups/131688/The-Vaktovian-Empire"
        >
          The Vaktovian Empire (VAK)
        </a>{" "}
        tested NFC&apos;s resilience; despite early successes, the clan&apos;s
        stamina waned, leading to another defeat. These battles, though
        unsuccessful, showcased NFC&apos;s enduring spirit in the face of
        adversity.
      </p>

      <h2 data-history-header id="resurgence-and-transition">
        Resurgence and Transition{" "}
        <span className={styles.yearRange}>(2014–2015)</span>
      </h2>
      <p>
        Following the VAK conflict, Fireantfive stepped down, passing leadership
        to{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/users/64404/profile"
        >
          BelmontLegend255
        </a>
        . His tenure, marked by robust activity and internal reorganization,
        restored a sense of optimism. Supported by a skilled high command,
        BelmontLegend255 led NFC to a landmark victory over{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/groups/199219/Vortex-Security"
        >
          Vortex Security (VS)
        </a>{" "}
        in December 2014, a triumph that validated the clan&apos;s resurgence.
        Yet, on December 31, 2014, BelmontLegend255&apos;s unexpected retirement
        left the clan in the hands of{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/users/40544/profile"
        >
          AustinLink
        </a>
        , who, unprepared for the role, presided over a decline. His brief
        tenure ended in February 2015, when ownership passed to{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/users/17721897/profile"
        >
          Ezaiahs
        </a>
        , signaling yet another transition in NFC&apos;s tumultuous journey.
      </p>

      <h2 data-history-header id="prolonged-decline">
        Prolonged Decline{" "}
        <span className={styles.yearRange}>(2015–2017)</span>
      </h2>
      <p>
        Ezaiahs&apos; nearly two-year reign was defined by ambitious reforms,
        yet he could not stem the tide of NFC&apos;s dwindling activity. The
        clan&apos;s decline mirrored broader shifts in the clan world, and
        internal tensions simmered, erupting in several near-rebellions. In
        January 2017, council member Thelegender orchestrated a coup, ousting
        Ezaiahs through a vote by council members{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/users/13085190/profile"
        >
          WoopiWoopi
        </a>
        ,{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/users/55383563/profile"
        >
          rescinded
        </a>
        , and{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/users/44052422/profile"
        >
          FrostyShxdows
        </a>
        . On January 6, 2017, Thelegender assumed ownership, only to resign
        abruptly after eight days, leaving the clan in the care of{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/users/336003/profile"
        >
          NoAlias
        </a>{" "}
        (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.roblox.com/users/13912707/profile"
        >
          WannaBet
        </a>
        ). An election followed, with WoopiWoopi narrowly defeating rescinded to
        become Chancellor, marking a new chapter in NFC&apos;s storied history.
      </p>
    </div>
  );
}
