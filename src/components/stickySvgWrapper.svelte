<script>
  import { hoveredIndex } from "../store.js";
  export let presidents = [];
  export let selectedCircleId;
  export let svgSize;
  export let totalDots;
  export let radius;
  export let concentricRadius;
  export let isMobile = false;
  export let getInitials;
  export let handleCircleHover;
  export let handleCircleClick;
  //export let hoveredIndex;

  let mobileHorizontalLine = 20;
  let desktopHOrizontalLine = 30;

  $: console.log($hoveredIndex);
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
    <g>
      <text
        x={isMobile
          ? 10 + (index % 2 !== 0 ? 26 : 6)
          : (index / (totalDots - 1)) * (svgSize - 2 * radius) + radius}
        y={isMobile
          ? (index / (totalDots - 1)) * (svgSize - 2 * radius) + radius + 4
          : 18 + (index % 2 !== 0 ? 6 : 0)}
        text-anchor="middle"
        font-size={isMobile ? "9px" : "10px"}
        fill="black"
        dy={isMobile ? undefined : "4"}
      >
        {getInitials(president.name)}
      </text>

      <circle
        cx={isMobile
          ? 10 + (index % 2 !== 0 ? 26 : 6)
          : (index / (totalDots - 1)) * (svgSize - 2 * radius) + radius}
        cy={isMobile
          ? (index / (totalDots - 1)) * (svgSize - 2 * radius) + radius
          : 18 + (index % 2 !== 0 ? 6 : 0)}
        r={radius}
        fill="white"
        opacity="0.3"
        stroke="black"
        stroke-width={selectedCircleId == index ? "3" : "1"}
        class={`circle-${index}`}
        data-index={index}
        pointer-events="all"
        on:mouseover={handleCircleHover}
        on:click={handleCircleClick}
        on:focus={handleCircleHover}
        on:keydown={(e) => e.key === "Enter" && handleCircleClick(e)}
      />

      {#if president["terms"] === 2}
        <circle
          cx={isMobile
            ? 10 + (index % 2 !== 0 ? 26 : 6)
            : (index / (totalDots - 1)) * (svgSize - 2 * radius) + radius}
          cy={isMobile
            ? (index / (totalDots - 1)) * (svgSize - 2 * radius) + radius
            : 18 + (index % 2 !== 0 ? 6 : 0)}
          r={concentricRadius}
          fill="white"
          opacity="0.3"
          stroke="black"
          stroke-width={selectedCircleId == index ? "3" : "1"}
          class={`circle-${index}`}
          data-index={index}
          pointer-events="all"
          on:mouseover={handleCircleHover}
          on:click={handleCircleClick}
          on:focus={handleCircleHover}
          on:keydown={(e) => e.key === "Enter" && handleCircleClick(e)}
        />
      {/if}

      {#if $hoveredIndex == index}
        <text
          x={isMobile
            ? 10 + (index % 2 !== 0 ? 26 : 6) + 5
            : (index / (totalDots - 1)) * (svgSize - 2 * radius) + radius + 5}
          y={isMobile
            ? (index / (totalDots - 1)) * (svgSize - 2 * radius) + radius
            : 18 + (index % 2 !== 0 ? 6 : 0) - 10}
          fill="black"
          font-size="10"
        >
          {president.name}
        </text>

        <line
          x1={isMobile
            ? 10 + (index % 2 !== 0 ? 26 : 6)
            : (index / (totalDots - 1)) * (svgSize - 2 * radius) + radius}
          y1={isMobile
            ? (index / (totalDots - 1)) * (svgSize - 2 * radius) + radius
            : 18 + (index % 2 !== 0 ? 6 : 0)}
          x2={isMobile
            ? 10 + (index % 2 !== 0 ? 26 : 6) - mobileHorizontalLine
            : (index / (totalDots - 1)) * (svgSize - 2 * radius) + radius}
          y2={isMobile
            ? (index / (totalDots - 1)) * (svgSize - 2 * radius) + radius
            : 18 + (index % 2 !== 0 ? 6 : 0) + desktopHOrizontalLine}
          stroke="black"
          stroke-width="1"
          aria-hidden="true"
        />
      {/if}
    </g>
  {/each}
</svg>
