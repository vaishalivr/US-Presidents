<script>
  import OnePresidentUnitMainCircle from "./OnePresidentUnitMainCircle.svelte";
  import OnePresidentUnitName from "./OnePresidentUnitName.svelte";
  import OnePresidentUnitTimeline from "./OnePresidentUnitTimeline.svelte";
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
  //export let hoveredDeathIndex = null;
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

  <OnePresidentUnitTimeline
    {cx}
    {cy}
    {outerRadius}
    {stroke}
    {strokeWidth}
    {index}
    {hoveredBirthIndex}
  />

  <OnePresidentUnitName {cx} {cy} {outerRadius} {index} />
</g>
