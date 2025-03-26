<script>
  export let presidents = [];
  export let selectedCircleId;
  export let svgSize;
  export let totalDots;
  export let radius;
  export let concentricRadius;
  export let isMobile = false;
  export let getInitials;
  export let handleCircleClick;
</script>

<svg width="100%" height="100%">
  <rect
    x="0"
    y="0"
    width="100%"
    height="100%"
    fill="white"
    stroke="black"
    stroke-width="2"
  />

  {#each presidents as president, index}
    <text
      x={isMobile
        ? 10
        : (index / (totalDots - 1)) * (svgSize - 2 * radius) + radius}
      y={isMobile
        ? (index / (totalDots - 1)) * (svgSize - 2 * radius) + radius + 4
        : 18}
      text-anchor="middle"
      font-size={isMobile ? "6px" : "9px"}
      fill="black"
      dy={isMobile ? undefined : "4"}
    >
      {getInitials(president.name)}
    </text>

    <g>
      <circle
        cx={isMobile
          ? 10
          : (index / (totalDots - 1)) * (svgSize - 2 * radius) + radius}
        cy={isMobile
          ? (index / (totalDots - 1)) * (svgSize - 2 * radius) + radius
          : 18}
        r={radius}
        fill="white"
        opacity="0.3"
        stroke="black"
        stroke-width={selectedCircleId == index ? "3" : "1"}
        class={`circle-${index}`}
        data-index={index}
        on:click={handleCircleClick}
        on:keydown={(e) => e.key === "Enter" && handleCircleClick(e)}
      />

      {#if president["terms"] === 2}
        <circle
          cx={isMobile
            ? 10
            : (index / (totalDots - 1)) * (svgSize - 2 * radius) + radius}
          cy={isMobile
            ? (index / (totalDots - 1)) * (svgSize - 2 * concentricRadius) +
              concentricRadius
            : 18}
          r={concentricRadius}
          fill="white"
          opacity="0.3"
          stroke="black"
          stroke-width={selectedCircleId == index ? "3" : "1"}
          class={`circle-${index}`}
          data-index={index}
          on:click={handleCircleClick}
          on:keydown={(e) => e.key === "Enter" && handleCircleClick(e)}
        />
      {/if}
    </g>
  {/each}
</svg>
