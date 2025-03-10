<script>
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
  let hoveredArc = null;

  function calculateArcPath(cx, cy, radius, arcIndex, totalArcs) {
    const anglePerArc = (2 * Math.PI) / totalArcs;
    const startAngle = arcIndex * anglePerArc;
    const endAngle = (arcIndex + 1) * anglePerArc;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
  }
  $: console.log($selectedCircleId);
  $: console.log(`circle-${$selectedCircleId}`);
</script>

<g
  class={"circle-" + index}
  opacity={`circle-${$selectedCircleId}` === null ||
  `circle-${$selectedCircleId}` === "circle-" + index
    ? 1
    : 0.3}
>
  {#each Array($presidents[index].keyPolicies).fill(0) as _, arcIndex}
    <!-- make arcs based on policies -->
    <path
      d={calculateArcPath(
        cx,
        cy,
        outerRadius,
        arcIndex,
        $presidents[index].keyPolicies
      )}
      fill={hoveredArc === `${index}-${arcIndex}` ? "lightblue" : "transparent"}
      stroke="black"
      stroke-width="2px"
      on:mouseover={() => (hoveredArc = `${index}-${arcIndex}`)}
      on:mouseout={() => (hoveredArc = null)}
      on:focus={() => (hoveredArc = `${index}-${arcIndex}`)}
      on:blur={() => (hoveredArc = null)}
    />
  {/each}
  <!-- president's main circle -->
  <circle
    {cx}
    {cy}
    r={innerRadius}
    {stroke}
    stroke-width={strokeWidth}
    {fill}
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
  <text
    x={cx}
    y={cy + outerRadius * 1.5 - 20}
    text-anchor="middle"
    font-size="16px"
    fill="black"
  >
    {$presidents[index].name}
  </text>

  <!-- presidents years in power -->
  <text
    x={cx}
    y={cy + outerRadius * 1.5 - 5}
    text-anchor="middle"
    font-size="14px"
    fill="black"
  >
    {$presidents[index].presidencyStart} - {$presidents[index].presidencyEnd}
  </text>

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
  {/if}
</g>
