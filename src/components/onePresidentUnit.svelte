<script>
  import OnePresidentUnitMainCircle from "./OnePresidentUnitMainCircle.svelte";
  import OnePresidentUnitName from "./OnePresidentUnitName.svelte";
  import { presidents } from "../data/presidentsData";
  import { selectedCircleId } from "../store.js";

  export let cx;
  export let cy;
  export let innerRadius;
  export let outerRadius;
  export let stroke = "black";
  export let strokeWidth = "3px";
  export let fill = "white";
  export let index;
  export let hoveredBirthIndex = null;
  export let hoveredDeathIndex = null;
</script>

<g
  class={"circle-" + index}
  opacity={`circle-${$selectedCircleId}` === "circle-null" ||
  `circle-${$selectedCircleId}` === "circle-" + index ||
  $presidents[$selectedCircleId]?.otherPresidents.includes(
    $presidents[index].name
  )
    ? 1
    : 0.4}
>
  <!-- president's main circle -->
  <OnePresidentUnitMainCircle
    {cx}
    {cy}
    {innerRadius}
    {outerRadius}
    {stroke}
    {strokeWidth}
    {fill}
    {index}
  />

  <line
    x1={cx - outerRadius}
    y1={cy + outerRadius * 1.5}
    x2={cx + outerRadius}
    y2={cy + outerRadius * 1.5}
    {stroke}
    stroke-width={strokeWidth}
  />

  <!-- president's birth circle -->
  <circle
    cx={cx - outerRadius}
    cy={cy + outerRadius * 1.5}
    r="4"
    fill="black"
    on:mouseover={() => (hoveredBirthIndex = index)}
    on:mouseout={() => (hoveredBirthIndex = null)}
    on:focus={() => (hoveredBirthIndex = index)}
    on:blur={() => (hoveredBirthIndex = null)}
  />

  <!-- presidents birth circle tooltip -->
  {#if hoveredBirthIndex === index}
    <text
      x={cx - outerRadius}
      y={cy + outerRadius * 1.5 + 25}
      text-anchor="middle"
      font-size="12px"
      fill="black"
    >
      <tspan x={cx - outerRadius} dy="0">
        Born to {$presidents[index].parents}
      </tspan>
      <tspan x={cx - outerRadius} dy="15">
        at {$presidents[index].birthPlace}
      </tspan>
    </text>
  {/if}

  <!-- presidents dead circle or alive line tooltip -->
  {#if $presidents[index].status === "dead"}
    <circle
      cx={cx + outerRadius}
      cy={cy + outerRadius * 1.5}
      r="4"
      fill="black"
      on:mouseover={() => (hoveredDeathIndex = index)}
      on:mouseout={() => (hoveredDeathIndex = null)}
      on:focus={() => (hoveredDeathIndex = index)}
      on:blur={() => (hoveredDeathIndex = null)}
    />

    <!-- tooltip to show only when the death circle is hovered  -->
    {#if hoveredDeathIndex === index}
      <text
        x={cx - outerRadius}
        y={cy + outerRadius * 1.5 + 25}
        text-anchor="middle"
        font-size="12px"
        fill="black"
      >
        <tspan x={cx + outerRadius} dy="0">
          Died at {$presidents[index].deathPlace}
        </tspan>
        <tspan x={cx + outerRadius} dy="15">
          for {$presidents[index].deathReason}
        </tspan>
      </text>
    {/if}

    <text
      x={cx + outerRadius + 10}
      y={cy + outerRadius * 1.5 + 5}
      text-anchor="start"
      font-size="0.9rem"
      fill="black"
    >
      {$presidents[index].deathYear}
    </text>
  {:else}
    <line
      x1={cx + outerRadius}
      y1={cy + outerRadius * 1.45}
      x2={cx + outerRadius}
      y2={cy + outerRadius * 1.55}
      stroke="black"
      stroke-width="3px"
    />
  {/if}

  <!-- presidents name -->
  <OnePresidentUnitName {cx} {cy} {outerRadius} {index} />

  <!-- presidents birth year -->
  <text
    x={cx - outerRadius - 10}
    y={cy + outerRadius * 1.5 + 5}
    text-anchor="end"
    font-size="0.9rem"
    fill="black"
  >
    {$presidents[index].birthYear}
  </text>

  <!-- presidency start circle -->
  <circle
    cx={cx -
      outerRadius +
      (($presidents[index].presidencyStart - $presidents[index].birthYear) /
        (($presidents[index].deathYear === ""
          ? 2025
          : $presidents[index].deathYear) -
          $presidents[index].birthYear)) *
        (2 * outerRadius)}
    cy={cy + outerRadius * 1.5}
    r="4"
    fill="teal"
  />

  <!-- presidency start year text -->
  <text
    x={cx -
      outerRadius +
      (($presidents[index].presidencyStart - $presidents[index].birthYear) /
        (($presidents[index].deathYear === ""
          ? 2025
          : $presidents[index].deathYear) -
          $presidents[index].birthYear)) *
        (2 * outerRadius)}
    y={cy + outerRadius * 1.7}
    text-anchor="end"
    font-size="0.9rem">{$presidents[index].presidencyStart}</text
  >

  <!-- presidency end circle -->
  {#if $presidents[index].presidencyEnd !== "Current President"}
    <circle
      cx={cx -
        outerRadius +
        (($presidents[index].presidencyEnd - $presidents[index].birthYear) /
          (($presidents[index].deathYear === ""
            ? 2025
            : $presidents[index].deathYear) -
            $presidents[index].birthYear)) *
          (2 * outerRadius)}
      cy={cy + outerRadius * 1.5}
      r="4"
      fill="teal"
    />
    <text
      x={cx -
        outerRadius +
        (($presidents[index].presidencyEnd - $presidents[index].birthYear) /
          (($presidents[index].deathYear === ""
            ? 2025
            : $presidents[index].deathYear) -
            $presidents[index].birthYear)) *
          (2 * outerRadius)}
      y={cy + outerRadius * 1.7}
      text-anchor="start"
      font-size="0.9rem">{$presidents[index].presidencyEnd}</text
    >
  {/if}

  <!-- foreign object to fit quote -->
  {#if $presidents[$selectedCircleId] || $presidents[$selectedCircleId]?.otherPresidents.includes($presidents[index].name)}
    <foreignObject
      x={cx - outerRadius}
      y={cy + outerRadius * 1.6}
      width={outerRadius * 2.4}
      height="90"
    >
      <div
        id={"president-" + index + "-Quote"}
        style="text-align:center; font-size: 0.75rem"
      >
        {#each $presidents[$selectedCircleId]?.otherPresidentThings as obj}
          {#if obj[$presidents[index].name]}
            {obj[$presidents[index].name]}
          {/if}
        {/each}
      </div>
    </foreignObject>
  {/if}
</g>

<!-- <style>
  image:focus,
  image:active {
    outline: none;
  }

  path:focus {
    outline: none;
  }

  path:focus-visible {
    outline: 2px solid black; /* focus visible for keyboard users */
  }
</style> -->
