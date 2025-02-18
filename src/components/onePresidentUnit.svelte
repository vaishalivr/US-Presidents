<script>
  export let cx;
  export let cy;
  export let innerRadius;
  export let outerRadius;
  export let stroke = "black";
  export let strokeWidth = "3px";
  export let fill = "white";
  //   export let index;
  //   export let hoveredBirthIndex = null;
</script>

<circle {cx} {cy} r={innerRadius} {stroke} stroke-width={strokeWidth} {fill} />

<line
  x1={cx - outerRadius}
  y1={cy + outerRadius * 1.5}
  x2={cx + outerRadius}
  y2={cy + outerRadius * 1.5}
  {stroke}
  stroke-width={strokeWidth}
/>

<!-- president's birth circle -->
<!-- <circle
  cx={cx - $outerRadius}
  cy={cy + $outerRadius * 1.5}
  r="4"
  fill="black"
  on:mouseover={() => (hoveredBirthIndex = index)}
  on:mouseout={() => (hoveredBirthIndex = null)}
  on:focus={() => (hoveredBirthIndex = index)}
  on:blur={() => (hoveredBirthIndex = null)}
/> -->
