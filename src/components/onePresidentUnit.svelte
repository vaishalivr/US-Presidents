<script>
  export let cx;
  export let cy;
  export let parts;
  export let name;

  let innerRadius = 40;
  let outerRadius = 60;
  let fill = "white";
  let stroke = "black";
  let strokeWidth = 1;

  let defaultStrokeWidth = 3;
  let defaultFill = "white";
  let hoverFill = "#d3d3d3";

  $: lineCoords = {
    x1: cx - outerRadius,
    x2: cx + outerRadius,
    y1: cy + outerRadius + 30,
    y2: cy + outerRadius + 30,
  };

  $: arcs = Array.from({ length: parts }, (_, i) => {
    const angle = (2 * Math.PI) / parts;
    const startX = cx + outerRadius * Math.cos(i * angle);
    const startY = cy + outerRadius * Math.sin(i * angle);
    const endX = cx + outerRadius * Math.cos((i + 1) * angle);
    const endY = cy + outerRadius * Math.sin((i + 1) * angle);

    return {
      d: `M ${cx} ${cy} L ${startX} ${startY} A ${outerRadius} ${outerRadius} 0 0 1 ${endX} ${endY} Z`,
      strokeWidth: defaultStrokeWidth,
      fill: defaultFill,
    };
  });

  const updateFillColor = (index, color) => {
    arcs = arcs.map((arc, i) => (i === index ? { ...arc, fill: color } : arc));
  };
</script>

{#each arcs as arc, i}
  <path
    d={arc.d}
    fill={arc.fill}
    stroke="black"
    stroke-width={arc.strokeWidth}
    tabindex="0"
    role="button"
    on:mouseover={() => updateFillColor(i, hoverFill)}
    on:mouseout={() => updateFillColor(i, defaultFill)}
    on:focus={() => updateFillColor(i, hoverFill)}
    on:blur={() => updateFillColor(i, defaultFill)}
  />
{/each}

<circle {cx} {cy} r={innerRadius} {fill} {stroke} stroke-width={strokeWidth} />

<line
  x1={lineCoords.x1}
  y1={lineCoords.y1}
  x2={lineCoords.x2}
  y2={lineCoords.y2}
  {stroke}
  stroke-width={strokeWidth}
/>

<circle cx={lineCoords.x1} cy={lineCoords.y1} r="3" fill="black" />

<text
  x={(lineCoords.x1 + lineCoords.x2) / 2}
  y={lineCoords.y1 - 5}
  text-anchor="middle"
  font-size="12px"
  fill="black"
>
  {name}
</text>
