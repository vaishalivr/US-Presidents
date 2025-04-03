<script>
  import { presidents } from "../data/presidentsData";
  import { selectedCircleId } from "../store.js";
  export let cx;
  export let cy;
  export let innerRadius;
  export let outerRadius;
  export let stroke;
  export let strokeWidth;
  export let fill;
  export let index;
  let hoveredArc = null;

  function calculateArcPath(cx, cy, radius, arcIndex, totalArcs) {
    const anglePerArc = (2 * Math.PI) / totalArcs;

    const startAngle = -Math.PI / 2 + arcIndex * anglePerArc;
    const endAngle = -Math.PI / 2 + (arcIndex + 1) * anglePerArc;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
  }

  function handleImageClick(event) {
    event.stopPropagation(); // otherwise svg click is registered
    const id = event.target.dataset.index;
    selectedCircleId.set(null);
    setTimeout(() => {
      selectedCircleId.set(id);
    }, 0);
  }

  function handleImageKeydown(event) {
    console.log("key down on image");
  }

  function isActive(index) {
    return index.toString() === $selectedCircleId;
  }
</script>

{#each Array($presidents[index].policies.length).fill(0) as _, arcIndex}
  <path
    d={calculateArcPath(
      cx,
      cy,
      outerRadius,
      arcIndex,
      $presidents[index].policies.length
    )}
    fill={isActive(index) && hoveredArc === `${index}-${arcIndex}`
      ? "lightblue"
      : "white"}
    stroke="black"
    stroke-width="2px"
    on:mouseover={(event) => {
      event.stopPropagation();
      if (!isActive(index)) return;
      //TO DO: how to avoid getElementById
      hoveredArc = `${index}-${arcIndex}`;
      const div = document.getElementById(`president-${index}-Quote`);
      div.innerHTML = $presidents[index].policies[arcIndex];
    }}
    on:mouseout={() => {
      hoveredArc = null;
    }}
    on:focus={() => (hoveredArc = `${index}-${arcIndex}`)}
    on:blur={() => (hoveredArc = null)}
    on:click={(event) => {
      event.stopPropagation();
      if (!isActive(index)) return;
      if (index.toString() == $selectedCircleId) {
        //TO DO : how to avoid getElementById
        hoveredArc = `${index}-${arcIndex}`;
        const div = document.getElementById(`president-${index}-Quote`);
        div.innerHTML = $presidents[index].policies[arcIndex];
      }
    }}
    on:keydown={() => {
      hoveredArc = `${index}-${arcIndex}`;
    }}
  />
{/each}

<circle {cx} {cy} r={innerRadius} {stroke} stroke-width={strokeWidth} {fill} />

<image
  x={cx - innerRadius}
  y={cy - innerRadius}
  width={innerRadius * 2}
  height={innerRadius * 2}
  data-index={index}
  href={$presidents[index].image}
  clip-path="circle(50%)"
  on:click={(event) => handleImageClick(event)}
  on:keydown={(event) => handleImageKeydown(event)}
  tabindex="0"
  role="button"
/>

<style>
  image:focus,
  image:active {
    outline: none;
  }

  path:focus {
    outline: none;
  }

  path:focus-visible {
    outline: 2px solid black;
  }
</style>
