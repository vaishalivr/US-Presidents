<script>
  export let cx;
  export let cy;
  export let parts;
  export let name;
  export let status;
  export let birthYear;
  export let deathYear;
  export let presidencyStart;
  export let presidencyEnd;

  let innerRadius = 50; //40
  let outerRadius = 70; //60
  let fill = "white";
  let stroke = "black";
  let strokeWidth = 3;
  let presidencyStartMarkerStroke = "none";
  let presidencyEndMarkerStroke = "none";
  let extraGap = 30;

  let defaultStrokeWidth = 3;
  let defaultFill = "white";
  let hoverFill = "#d3d3d3";

  $: lineCoords = {
    x1: cx - outerRadius - extraGap, //adding 30 on either side
    x2: cx + outerRadius + extraGap, // adding 30 on either side
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

  $: xPresidencyStart =
    lineCoords.x1 +
    ((presidencyStart - birthYear) / (deathYear - birthYear)) *
      (lineCoords.x2 - lineCoords.x1);

  $: xPresidencyEnd =
    lineCoords.x1 +
    ((presidencyEnd - birthYear) / (deathYear - birthYear)) *
      (lineCoords.x2 - lineCoords.x1);

  const updateFillColor = (index, color) => {
    arcs = arcs.map((arc, i) => (i === index ? { ...arc, fill: color } : arc));
  };

  const presidencyStartMarkerMouseover = () => {
    presidencyStartMarkerStroke = "black";
  };

  const presidencyStartMarkerMouseout = () => {
    presidencyStartMarkerStroke = "none";
  };

  const presidencyEndMarkerMouseover = () => {
    presidencyEndMarkerStroke = "black";
  };

  const presidencyEndMarkerMouseout = () => {
    presidencyEndMarkerStroke = "none";
  };

  const birthMarkerMouseover = (event) => {
    console.log("birth marker mouseover");
    showTooltip = true;
    tooltipX = event.clientX + 10;
    tooltipY = event.clientY + 10;
    tooltipText = "Hello Baby";
  };

  const birthMarkerMouseout = () => {
    console.log("birth marker mouseout");
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

<!-- Main Life Span -->
<line
  x1={lineCoords.x1}
  y1={lineCoords.y1}
  x2={lineCoords.x2}
  y2={lineCoords.y2}
  {stroke}
  stroke-width={strokeWidth}
/>

<!-- Birth Marker -->
<circle
  cx={lineCoords.x1}
  cy={lineCoords.y1}
  r="3"
  fill="black"
  tabindex="0"
  role="button"
  on:mouseover={birthMarkerMouseover}
  on:mouseout={birthMarkerMouseout}
  on:focus={birthMarkerMouseover}
  on:blur={birthMarkerMouseout}
/>

<!-- Death Marker -->
{#if status === "dead"}
  <circle cx={lineCoords.x2} cy={lineCoords.y2} r="3" fill="black" />
{:else}
  <line
    x1={lineCoords.x2}
    y1={lineCoords.y2 - 5}
    x2={lineCoords.x2}
    y2={lineCoords.y2 + 5}
    stroke="black"
    stroke-width="2"
  />
{/if}

<!-- Presidents Name -->
<text
  x={(lineCoords.x1 + lineCoords.x2) / 2}
  y={lineCoords.y1 - 5}
  text-anchor="middle"
  font-size="1rem"
  fill="black"
>
  {name}
</text>

<!-- Presidency Start Marker -->
<!-- to add stroke width to this stroke -->
<circle
  cx={xPresidencyStart}
  cy={lineCoords.y1}
  stroke={presidencyStartMarkerStroke}
  r="5"
  fill="red"
  tabindex="0"
  role="button"
  on:mouseover={() => presidencyStartMarkerMouseover()}
  on:mouseout={() => presidencyStartMarkerMouseout()}
  on:focus={() => presidencyStartMarkerMouseover()}
  on:blur={() => presidencyStartMarkerMouseout()}
/>

<!-- Presidency End Marker -->
<circle
  cx={xPresidencyEnd}
  cy={lineCoords.y1}
  stroke={presidencyEndMarkerStroke}
  r="5"
  fill="red"
  tabindex="0"
  role="button"
  on:mouseover={() => presidencyEndMarkerMouseover()}
  on:mouseout={() => presidencyEndMarkerMouseout()}
  on:focus={() => presidencyEndMarkerMouseover()}
  on:blur={() => presidencyEndMarkerMouseout()}
/>
