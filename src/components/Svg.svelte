<script>
  import Circles from "./Circles.svelte";
  export let circle = [];
</script>

<svg width="500" height="500">
  <rect width="500" height="500" stroke="black" stroke-width="3px" fill="none"
  ></rect>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
    >this is svg</text
  >
  <Circles {circle} />
</svg>
