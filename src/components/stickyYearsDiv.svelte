<script>
  import * as d3 from "d3";
  import { presidents } from "../data/presidentsData";
  import { onMount } from "svelte";
  import { selectedCircleId } from "../store.js";

  let totalDots = 47;

  let svgWidth = 0;
  let svgHeight = 0;
  const desktopRadius = 8;
  const desktopConcentricRadius = 10;
  const mobileRadius = 4;

  const updateDimensions = () => {
    svgWidth = window.innerWidth;
    svgHeight = window.innerHeight;
  };

  onMount(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
  });

  const handleCircleClick = (event) => {
    selectedCircleId.set(event.target.id);
    // console.log(selectedCircleId);

    d3.select(`#${selectedCircleId}`)
      .attr("stroke", "black")
      .attr("stroke-width", "3");
  };

  const getInitials = (name) => {
    const parts = name.split(" ");
    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }
    const firstInitial = parts[0][0].toUpperCase();
    const lastInitial = parts[parts.length - 1][0].toUpperCase();
    return firstInitial + lastInitial;
  };
</script>

<div class="desktop-div">
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

    <!-- code for all circles in a row -->
    {#each $presidents as president, index}
      <text
        x={(index / (totalDots - 1)) * (svgWidth - 2 * desktopRadius) +
          desktopRadius}
        y="18"
        text-anchor="middle"
        font-size="9px"
        fill="black"
        dy="4"
      >
        {getInitials(president.name)}
      </text>

      <g>
        <circle
          cx={(index / (totalDots - 1)) * (svgWidth - 2 * desktopRadius) +
            desktopRadius}
          cy="18"
          r={desktopRadius}
          fill="white"
          opacity="0.3"
          stroke="black"
          id={`circle-${index}`}
          on:click={handleCircleClick}
          on:keydown={(e) => e.key === "Enter" && handleCircleClick(e)}
        />

        {#if president["terms"] === 2}
          <circle
            cx={(index / (totalDots - 1)) * (svgWidth - 2 * desktopRadius) +
              desktopRadius}
            cy="18"
            r={desktopConcentricRadius}
            fill="white"
            opacity="0.3"
            stroke="black"
            id={`circle-${index}`}
            on:click={handleCircleClick}
            on:keydown={(e) => e.key === "Enter" && handleCircleClick(e)}
          />
        {/if}
      </g>
    {/each}
  </svg>
</div>

<div class="mobile-div">
  <svg width="100%" height="100%">
    <rect
      x="0"
      y="0"
      width="100%"
      height="100%"
      fill="none"
      stroke="black"
      stroke-width="2"
    />

    {#each $presidents as president, index}
      <text
        x="10"
        y={(index / (totalDots - 1)) * (svgHeight - 2 * mobileRadius) +
          mobileRadius +
          4}
        text-anchor="middle"
        font-size="6px"
        fill="black"
      >
        {getInitials(president.name)}
      </text>

      <circle
        cx="10"
        cy={(index / (totalDots - 1)) * (svgHeight - 2 * mobileRadius) +
          mobileRadius}
        r={mobileRadius}
        fill="white"
        opacity="0.3"
        stroke="black"
        id={`circle-${index}`}
        on:click={handleCircleClick}
        on:keydown={(e) => e.key === "Enter" && handleCircleClick(e)}
      />
    {/each}
  </svg>
</div>

<style>
  .desktop-div {
    position: sticky;
    bottom: 0;
    z-index: 10;
    border: 1px solid black;
    height: 6rem;
    width: 100vw;
    margin: 0;
    padding: 0;
  }

  .mobile-div {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    border: 1px solid black;
    z-index: 10;
    width: 2rem;
    display: none;
  }

  @media (max-width: 1000px) {
    .desktop-div {
      display: none;
    }

    .mobile-div {
      display: block;
    }
  }
</style>
