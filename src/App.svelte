<script>
  import Svg from "./components/Svg.svelte";
  import StickyYearsDiv from "./components/stickyYearsDiv.svelte";
</script>

<main>
  <Svg />
  <StickyYearsDiv />
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
