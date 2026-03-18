export function runSecureMCP() {
  // ─────────────────────────────────────────────
  // ANIMATION CONFIG — tweak everything here
  // ─────────────────────────────────────────────
  const CONFIG = {
    // ScrollTrigger — add [data-illustration] to your SVG wrapper in Webflow
    scrollTrigger: {
      trigger: '[data-illustration]',
      start: 'bottom bottom',
      markers: true,
    },

    // Gap between each section in the master timeline
    sectionGap: '-=0.5',

    // Shared easing for reveal tweens
    ease: 'back.out(1.7)',

    // How far elements drop in from (px)
    dropY: 30,

    // Section 1 — Data Sources and Tools
    dataSources: {
      layers: { duration: 0.3, stagger: 0.08, dropY: 30 },
      tools: { duration: 0.25, stagger: 0.06, dropY: 30, gap: '-=0.4' },
      label: { duration: 0.2, gap: '+=0.05' },
    },

    // Section 2 — Entity & Metric Resolution
    entityMetric: {
      outerCard: { duration: 0.3 },
      innerCard: { duration: 0.25, overlap: '-=0.5' },
      label: { duration: 0.2, gap: '-=0.05' },
    },

    // Section 3 — People Context Ontology
    peopleContext: {
      outerCard: { duration: 0.3 },
      innerCard: { duration: 0.25, overlap: '-=0.15' },
      label: { duration: 0.2, gap: '+=0.05' },
    },

    // Section 4 — Governance, Roles and Permissions
    governance: {
      layers: { duration: 0.3, stagger: 0.08 },
      label: { duration: 0.2, gap: '+=0.05' },
    },

    // Section 5 — Human Intelligence
    humanIntelligence: {
      card: { duration: 0.3 },
      logo: { duration: 0.2, overlap: '-=0.1' },
    },

    // Section 6 — Highlight prism outline
    highlight: {
      fill: { duration: 0.3 },
      stroke: { duration: 1, ease: 'power4.in', overlap: '-=0.1' },
      gap: '-=0.6',
    },

    // Section 7 — MCP + Agent Builders
    mcpAgents: {
      mcp: { duration: 0.3 },
      agentLabel: { duration: 0.2 },
      tiles: { duration: 0.3, stagger: 0.1, gap: '-=0.08' },
      stdLabel: { duration: 0.2 },
    },

    // ─── Float animations (post-reveal) ──────────────────────────────────────
    // y/ease on the section = default for all layers. Override per-layer by adding y on that layer.
    floats: {
      // Entity & Metric Resolution
      entityMetric: {
        y: -6,
        ease: 'sine.inOut',
        layer_4: { duration: 1.8, delay: 0 },
        layer_5: { duration: 1.8, delay: 0.1, y: -4 },
      },
      // People Context Ontology
      peopleContext: {
        y: -6,
        ease: 'sine.inOut',
        layer_6: { duration: 1.9, delay: 0, y: -1 },
        layer_7: { duration: 1.7, delay: 0.25 },
      },
      // Governance, Roles and Permissions
      governance: {
        y: -6,
        ease: 'sine.inOut',
        layer_8: { duration: 1.8, delay: 0 },
        layer_9: { duration: 2.0, delay: 0.2 },
        layer_10: { duration: 1.7, delay: 0.4 },
      },
      // MCP + Agent Builders
      mcpAgents: {
        y: -8,
        ease: 'sine.inOut',
        mcp: { duration: 1.6, delay: 0 },
        layer_12: { duration: 1.7, delay: 0.2, y: 1 },
        layer_11: { duration: 1.9, delay: 0.4 },
        claude: { duration: 1.8, delay: 0.6 },
        agentBuilder: { duration: 2.0, delay: 0.8 },
      },
    },
    // ─────────────────────────────────────────────────────────────────────────
  };
  // ─────────────────────────────────────────────

  /**
   * IllustrationAnimation
   * Master animation sequence for the architecture diagram.
   * Animates sections bottom to top:
   * 1. Data sources and tools
   * 2. Entity & Metric Resolution
   * 3. People Context Ontology
   * 4. Governance, roles and permissions
   * 5. Human Intelligence
   * 6. Highlight prism outline (DrawSVG)
   * 7. MCP + Agent Builders
   */
  const IllustrationAnimation = (() => {
    // Governance group IDs contain special chars — can't use CSS selectors
    const getGovernanceEl = () => document.querySelector('[id^="governance,roles"]');

    const hideAll = () => {
      gsap.set(
        '#highlight, #dotted-line, #dotted-line_2, #dotted-line_3, #dotted-line_4, #data-source-tools, #entity-metric-resolution, #people-context-ontology, #human-intelligence, #standardize, #mcp, #agent-builders',
        { autoAlpha: 0 }
      );
      gsap.set(getGovernanceEl(), { autoAlpha: 0 });

      gsap.set('#workday, #greenhouse, #lattice, #slack', { autoAlpha: 0, y: 15 });
      gsap.set('#label, #label_2, #label_3, #label_4', { autoAlpha: 0 });

      // Agent builder tiles hidden individually so parent group can be revealed
      // without flashing all children at once
      gsap.set('#layer_11, #layer_12, #claude, #agent-builder_2, #label_6', { autoAlpha: 0 });

      // Highlight fill hidden individually — drawSVG deferred to highlightTimeline
      // so path length is measured after the parent is visible
      gsap.set('#highlight > path:first-child', { autoAlpha: 0 });
    };

    // Section 1: Data sources and tools
    const dataSourcesTimeline = () => {
      const c = CONFIG.dataSources;
      const tl = gsap.timeline({ defaults: { ease: CONFIG.ease } });

      tl.set('#data-source-tools', { autoAlpha: 1 })
        .from('#layer, #layer_2, #layer_3', {
          y: c.layers.dropY,
          autoAlpha: 0,
          duration: c.layers.duration,
          stagger: c.layers.stagger,
        })
        .to(
          '#workday, #greenhouse, #lattice, #slack',
          {
            autoAlpha: 1,
            y: 0,
            duration: c.tools.duration,
            stagger: c.tools.stagger,
          },
          c.tools.gap
        )
        .to('#label', { autoAlpha: 1, duration: c.label.duration }, c.label.gap);

      return tl;
    };

    // Section 2: Entity & Metric Resolution
    const entityMetricTimeline = () => {
      const c = CONFIG.entityMetric;
      const tl = gsap.timeline({ defaults: { ease: CONFIG.ease } });

      tl.set('#entity-metric-resolution', { autoAlpha: 1 })
        .from('#layer_4', {
          y: CONFIG.dropY,
          autoAlpha: 0,
          duration: c.outerCard.duration,
        })
        .from(
          '#layer_5',
          {
            y: CONFIG.dropY,
            autoAlpha: 0,
            duration: c.innerCard.duration,
          },
          c.innerCard.overlap
        )
        .to('#label_2', { autoAlpha: 1, duration: c.label.duration }, c.label.gap)
        .add(() => {
          const h = CONFIG.floats.entityMetric;
          [
            ['#layer_4', h.layer_4],
            ['#layer_5', h.layer_5],
          ].forEach(([id, cfg]) => {
            floatTweens.push(
              gsap.to(id, {
                y: cfg.y ?? h.y,
                ease: h.ease,
                repeat: -1,
                yoyo: true,
                duration: cfg.duration,
                delay: cfg.delay,
              })
            );
          });
        });

      return tl;
    };

    // Section 3: People Context Ontology
    const peopleContextTimeline = () => {
      const c = CONFIG.peopleContext;
      const tl = gsap.timeline({ defaults: { ease: CONFIG.ease } });

      tl.set('#people-context-ontology', { autoAlpha: 1 })
        .from('#layer_6', {
          y: CONFIG.dropY,
          autoAlpha: 0,
          duration: c.outerCard.duration,
        })
        .from(
          '#layer_7',
          {
            y: CONFIG.dropY,
            autoAlpha: 0,
            duration: c.innerCard.duration,
          },
          c.innerCard.overlap
        )
        .to('#label_3', { autoAlpha: 1, duration: c.label.duration }, c.label.gap)
        .add(() => {
          const h = CONFIG.floats.peopleContext;
          [
            ['#layer_6', h.layer_6],
            ['#layer_7', h.layer_7],
          ].forEach(([id, cfg]) => {
            floatTweens.push(
              gsap.to(id, {
                y: cfg.y ?? h.y,
                ease: h.ease,
                repeat: -1,
                yoyo: true,
                duration: cfg.duration,
                delay: cfg.delay,
              })
            );
          });
        });

      return tl;
    };

    // Section 4: Governance, roles and permissions
    const governanceTimeline = () => {
      const c = CONFIG.governance;
      const tl = gsap.timeline({ defaults: { ease: CONFIG.ease } });

      tl.set(getGovernanceEl(), { autoAlpha: 1 })
        .from('#layer_8, #layer_9, #layer_10', {
          y: CONFIG.dropY,
          autoAlpha: 0,
          duration: c.layers.duration,
          stagger: c.layers.stagger,
        })
        .to('#label_4', { autoAlpha: 1, duration: c.label.duration }, c.label.gap)
        .add(() => {
          const h = CONFIG.floats.governance;
          [
            ['#layer_8', h.layer_8],
            ['#layer_9', h.layer_9],
            ['#layer_10', h.layer_10],
          ].forEach(([id, cfg]) => {
            floatTweens.push(
              gsap.to(id, {
                y: cfg.y ?? h.y,
                ease: h.ease,
                repeat: -1,
                yoyo: true,
                duration: cfg.duration,
                delay: cfg.delay,
              })
            );
          });
        });

      return tl;
    };

    // Section 5: Human Intelligence
    const humanIntelligenceTimeline = () => {
      const c = CONFIG.humanIntelligence;
      const tl = gsap.timeline({ defaults: { ease: CONFIG.ease } });

      tl.set('#human-intelligence', { autoAlpha: 1 })
        .from('#Vector_16', {
          y: CONFIG.dropY,
          autoAlpha: 0,
          duration: c.card.duration,
        })
        .from(
          '#HI-LogoBlack',
          {
            autoAlpha: 0,
            duration: c.logo.duration,
          },
          c.logo.overlap
        );

      return tl;
    };

    // Section 6: Highlight prism outline
    const highlightTimeline = () => {
      const c = CONFIG.highlight;
      const tl = gsap.timeline();

      tl.set('#highlight', { autoAlpha: 1 })
        .set('#highlight > path:last-child', { drawSVG: 0 })
        .to('#highlight > path:first-child', {
          autoAlpha: 1,
          duration: c.fill.duration,
          ease: CONFIG.ease,
        })
        .to(
          '#highlight > path:last-child',
          {
            drawSVG: '100%',
            duration: c.stroke.duration,
            ease: c.stroke.ease,
          },
          c.stroke.overlap
        );

      return tl;
    };

    // Section 7: MCP + Agent Builders
    const mcpAgentBuildersTimeline = () => {
      const c = CONFIG.mcpAgents;
      const tl = gsap.timeline({ defaults: { ease: CONFIG.ease } });

      tl.to('#standardize', { autoAlpha: 1, duration: c.stdLabel.duration })
        .fromTo(
          '#mcp',
          { y: CONFIG.dropY, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: c.mcp.duration }
        )
        .to('#label_6', { autoAlpha: 1, duration: c.agentLabel.duration })
        .set('#agent-builders', { autoAlpha: 1 })
        .fromTo(
          '#layer_12, #layer_11, #claude, #agent-builder_2',
          { y: CONFIG.dropY, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: c.tiles.duration, stagger: c.tiles.stagger }
        )
        .add(() => {
          const h = CONFIG.floats.mcpAgents;
          [
            ['#mcp', h.mcp],
            ['#layer_12', h.layer_12],
            ['#layer_11', h.layer_11],
            ['#claude', h.claude],
            ['#agent-builder_2', h.agentBuilder],
          ].forEach(([id, cfg]) => {
            floatTweens.push(
              gsap.to(id, {
                y: cfg.y ?? h.y,
                ease: h.ease,
                repeat: -1,
                yoyo: true,
                duration: cfg.duration,
                delay: cfg.delay,
              })
            );
          });
        });

      return tl;
    };

    const floatTweens = [];

    const init = () => {
      const scope = document.querySelector(CONFIG.scrollTrigger.trigger);
      gsap.context(() => {
        if (!scope) return;
        hideAll();

        gsap
          .timeline({
            delay: 1,
            scrollTrigger: {
              trigger: scope,
              start: CONFIG.scrollTrigger.start,
              once: true,
            },
          })
          .add(dataSourcesTimeline())
          .add(entityMetricTimeline(), CONFIG.sectionGap)
          .add(peopleContextTimeline(), CONFIG.sectionGap)
          .add(governanceTimeline(), CONFIG.sectionGap)
          .add(humanIntelligenceTimeline(), CONFIG.sectionGap)
          .add(highlightTimeline(), CONFIG.highlight.gap)
          .add(mcpAgentBuildersTimeline(), CONFIG.sectionGap);

        new IntersectionObserver(([entry]) => {
          floatTweens.forEach((t) => (entry.isIntersecting ? t.play() : t.pause()));
        }).observe(scope);
      }, scope);
    };

    return { init };
  })();

  IllustrationAnimation.init();
}
