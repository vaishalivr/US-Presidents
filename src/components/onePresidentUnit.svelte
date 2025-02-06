<script>
  export let cx;
  export let cy;
  let r = 50;
  let fill = "white";
  let stroke = "black";
  let strokeWidth = 3;
  let concentricRadius = r + 30;
  let linex1 = cx - concentricRadius;
  let linex2 = cx + concentricRadius;
  let liney1 = cy + concentricRadius + 12;
  let liney2 = cy + concentricRadius + 12;
</script>

<circle
  {cx}
  {cy}
  r={concentricRadius}
  fill="#d3d3d3"
  {stroke}
  stroke-width={strokeWidth}
/>
<circle {cx} {cy} {r} {fill} {stroke} stroke-width={strokeWidth} />

<line
  x1={linex1}
  y1={liney1}
  x2={linex2}
  y2={liney2}
  {stroke}
  stroke-width={strokeWidth}
></line>
