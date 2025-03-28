<script>
  import { presidents } from "../data/presidentsData";
  export let cx;
  export let cy;
  export let outerRadius;
  export let index;
</script>

<text
  x={cx}
  y={cy + outerRadius * 1.5 - 20}
  text-anchor="middle"
  font-size="16px"
  fill="black"
>
  {$presidents[index].name}
</text>
