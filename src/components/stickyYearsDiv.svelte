<script>
  import StickySvgWrapper from "./StickySvgWrapper.svelte";
  import { presidents } from "../data/presidentsData";
  import { onMount } from "svelte";
  import { selectedCircleId } from "../store.js";

  let totalDots = 47;
  let svgWidth = 0;
  let svgHeight = 0;

  const desktopRadius = 10;
  const desktopConcentricRadius = 15;
  const mobileRadius = 8;
  const mobileConcentricRadius = 12;

  const updateDimensions = () => {
    svgWidth = window.innerWidth;
    svgHeight = window.innerHeight;
  };

  onMount(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
  });

  const handleCircleHover = () => {
    console.log("here");
  };
  const handleCircleClick = (event) => {
    const id = event.target.dataset.index;
    selectedCircleId.set(id);
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

<div class="desktop-legend-intro-text">Desktop legend intro text</div>
<div class="mobile-legend-intro-text">Mobile legend intro text</div>

<div class="desktop-sticky-div">
  <StickySvgWrapper
    presidents={$presidents}
    selectedCircleId={$selectedCircleId}
    svgSize={svgWidth}
    {totalDots}
    radius={desktopRadius}
    concentricRadius={desktopConcentricRadius}
    isMobile={false}
    {getInitials}
    {handleCircleHover}
    {handleCircleClick}
  />
</div>

<div class="mobile-sticky-div">
  <StickySvgWrapper
    presidents={$presidents}
    selectedCircleId={$selectedCircleId}
    svgSize={svgHeight}
    {totalDots}
    radius={mobileRadius}
    concentricRadius={mobileConcentricRadius}
    isMobile={true}
    {getInitials}
    {handleCircleHover}
    {handleCircleClick}
  />
</div>

<style>
  :root {
    --mobile-sticky-legend-width: 4rem;
    --desktop-sticky-legend-height: 6rem;
  }

  .desktop-legend-intro-text {
    position: fixed;
    z-index: 100;
    text-align: left;
    bottom: var(--desktop-sticky-legend-height);
    display: block;
    margin-bottom: 1rem;
  }

  .mobile-legend-intro-text {
    position: fixed;
    top: 0;
    right: var(--mobile-sticky-legend-width);
    z-index: 100;
    display: block;
    display: none;
  }

  .desktop-sticky-div {
    position: sticky;
    bottom: 0;
    z-index: 10;
    border: 1px solid black;
    height: var(--desktop-sticky-legend-height);
    width: 100vw;
    margin: 0;
    padding: 0;
  }

  .mobile-sticky-div {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    border: 1px solid black;
    z-index: 10;
    width: var(--mobile-sticky-legend-width);
    display: none;
  }

  @media (max-width: 1000px) {
    .desktop-sticky-div {
      display: none;
    }

    .mobile-sticky-div {
      display: block;
    }

    .desktop-legend-intro-text {
      display: none;
    }

    .mobile-legend-intro-text {
      display: block;
    }
  }
</style>
