<script>
  import {
    svgWidth,
    svgHeight,
    outerRadius,
    innerRadius,
    maxCirclesPerRow,
    circleSpacing,
    rowSpacing,
    titleSpace,
    totalRows,
    selectedCircleId,
  } from "../store.js";

  import OnePresidentUnit from "./onePresidentUnit.svelte";
  import { presidents } from "../data/presidentsData";
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import OnePresidentUnitMainCircle from "./OnePresidentUnitMainCircle.svelte";
  let positions = [];

  function updateSvgWidth() {
    let screenWidth = window.innerWidth;

    if (screenWidth > 1024) {
      maxCirclesPerRow.set(3);
    } else if (screenWidth > 768) {
      maxCirclesPerRow.set(2);
    } else {
      maxCirclesPerRow.set(1);
    }
    let totalCirclesWidth = $maxCirclesPerRow * (2 * $outerRadius);
    let totalSpacing = ($maxCirclesPerRow + 1) * $circleSpacing;
    svgWidth.set(totalCirclesWidth + totalSpacing);
  }

  function updateSvgHeight() {
    let totalPresidents = get(presidents).length;

    let rows = Math.ceil(totalPresidents / get(maxCirclesPerRow));
    totalRows.set(rows);

    let totalCirclesHeight = rows * (2 * $outerRadius);
    let totalSpacing = rows * $rowSpacing;

    svgHeight.set($titleSpace + totalCirclesHeight + totalSpacing);
  }

  onMount(() => {
    updateSvgWidth();
    updateSvgHeight();
  });

  window.addEventListener("resize", () => {
    updateSvgWidth();
    updateSvgHeight();
  });

  $: positions = $presidents.map((_, index) => {
    let row = Math.floor(index / $maxCirclesPerRow);
    let col = index % $maxCirclesPerRow;

    let totalCirclesInRow = Math.min(
      $maxCirclesPerRow,
      $presidents.length - row * $maxCirclesPerRow
    );
    let rowWidth =
      totalCirclesInRow * ($outerRadius * 2 + $circleSpacing) - $circleSpacing;

    let colOffset = ($svgWidth - rowWidth) / 2;

    return {
      cx: col * ($outerRadius * 2 + $circleSpacing) + $outerRadius + colOffset,
      cy: row * ($outerRadius * 2 + $rowSpacing) + $outerRadius + $titleSpace,
    };
  });

  function handleSvgClick() {
    console.log("svg clicked");
    selectedCircleId.set(null);
  }

  function handlePresidentClick(index) {
    console.log("hello");
  }
</script>

<div id="introduction-div">
  <h1>A Journey Through the U.S. Presidency</h1>
  <h4>Vaishali Verma</h4>
  <div
    style="width: {$svgWidth}px; margin: 0 auto; line-height: 1.6; text-align: justify; font-size: 1.1em; font-weight:400"
  >
    <p>
      This interactive timeline traces the arc of American leadership — from the
      birth of the republic to the present day. Each circle represents a
      president, positioned by time and shaped by history. Explore how each
      leader shaped the nation through their key policies, personal journeys,
      and pivotal moments. Hover or click to dive into their stories, view their
      accomplishments, and reflect on how the presidency has evolved through
      wars, reforms, and revolutions of thought. Whether you're revisiting the
      founding fathers or examining modern leadership, this visualization
      invites you to connect with the people behind the office — and the legacy
      they leave behind.
    </p>
  </div>
  <div id="main-svg-div">
    <svg
      width={$svgWidth}
      height={$svgHeight}
      tabindex="0"
      role="button"
      aria-label="Presidential timeline"
      on:click={handleSvgClick}
      on:keydown={handleSvgClick}
    >
      <rect
        width={$svgWidth}
        height={$svgHeight}
        stroke="black"
        stroke-width="3px"
        fill="none"
      />
      <text
        x="50%"
        y="10"
        text-anchor="middle"
        font-size="1.2em"
        fill="black"
        dy="0.35em"
      >
        How To Read This Timeline
      </text>

      <image
        href="/images/howToRead.svg"
        x="50%"
        y="30"
        width="400"
        height="400"
        transform="translate(-200, 0)"
      />

      {#each positions as position, index}
        <OnePresidentUnit
          cx={position.cx}
          cy={position.cy}
          innerRadius={$innerRadius}
          outerRadius={$outerRadius}
          {index}
          on:presidentClick={() => handlePresidentClick(index)}
        />
      {/each}
    </svg>
  </div>
</div>
