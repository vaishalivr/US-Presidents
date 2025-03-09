<script>
  import { presidents } from "../data/presidentsData";
  import { onMount } from "svelte";
  import { selectedCircleId } from "../store.js";

  let totalDots = 47;

  let svgWidth = 0;
  let svgHeight = 0;
  const desktopRadius = 6;
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
    {#each Array(totalDots) as _, index}
      <circle
        cx={(index / (totalDots - 1)) * (svgWidth - 2 * desktopRadius) +
          desktopRadius}
        cy="18"
        r={desktopRadius}
        fill="white"
        stroke="black"
        id={`circle-${index}`}
        on:click={handleCircleClick}
        on:keydown={(e) => e.key === "Enter" && handleCircleClick(e)}
      />
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

    {#each Array(totalDots) as _, index}
      <circle
        cx="10"
        cy={(index / (totalDots - 1)) * (svgHeight - 2 * mobileRadius) +
          mobileRadius}
        r={mobileRadius}
        fill="red"
        id={`circle-${1732 + index}`}
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
