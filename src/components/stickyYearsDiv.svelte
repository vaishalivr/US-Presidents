<script>
  import StickySvgWrapper from "./StickySvgWrapper.svelte";
  import { presidents } from "../data/presidentsData";
  import { onMount } from "svelte";
  import { selectedCircleId } from "../store.js";

  let totalDots = 47;
  let svgWidth = 0;
  let svgHeight = 0;

  const desktopRadius = 8;
  const desktopConcentricRadius = 10;
  const mobileRadius = 5;
  const mobileConcentricRadius = 8;

  const updateDimensions = () => {
    svgWidth = window.innerWidth;
    svgHeight = window.innerHeight;
  };

  onMount(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
  });

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
    {handleCircleClick}
  />
</div>

<style>
  .desktop-sticky-div {
    position: sticky;
    bottom: 0;
    z-index: 10;
    border: 1px solid black;
    height: 6rem;
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
    width: 2rem;
    display: none;
  }

  @media (max-width: 1000px) {
    .desktop-sticky-div {
      display: none;
    }

    .mobile-sticky-div {
      display: block;
    }
  }
</style>
