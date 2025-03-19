<script>
  import Svg from "./components/Svg.svelte";
  import StickyYearsDiv from "./components/stickyYearsDiv.svelte";
  import Popup from "./components/popup.svelte";
  // import { onMount } from "svelte";
  // let popup;

  // onMount(() => {
  //   const a = document.querySelector(".pop-up");
  //   popup.style.visibility = "hidden";
  // });
</script>

<main>
  <Popup />
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
