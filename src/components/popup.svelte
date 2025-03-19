<script>
  import { selectedCircleId, popupVisible } from "../store.js";
  let popupContent;

  $: {
    if ($popupVisible && $selectedCircleId) {
      console.log("selected circle id:", $selectedCircleId);
      popupContent.style.visibility = "visible";
      popupContent.textContent = "Hello World";
    }
    if ($popupVisible && $selectedCircleId == null) {
      popupVisible.set(false);
      popupContent.style.visibility = "hidden";
      console.log("selected circle id is null");
    }
  }
</script>

<div class="pop-up" bind:this={popupContent}></div>

<style>
  .pop-up {
    visibility: hidden;
    border: 1px solid black;
    position: fixed;
    width: 200px;
    height: 200px;
    top: 10px;
    right: 10px;
  }
</style>
