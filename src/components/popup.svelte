<script>
  import { selectedCircleId, popupVisible } from "../store.js";
  import { presidents } from "../data/presidentsData";

  $: selectedPresident =
    $selectedCircleId !== null ? $presidents[$selectedCircleId] : null;

  function closePopup() {
    popupVisible.set(false);
  }
</script>

{#if $popupVisible && $selectedCircleId}
  <div class="pop-up" on:click={closePopup} on:keydown={closePopup}>
    <p>{selectedPresident.name}</p>
    <p>{selectedPresident.otherPresidents}</p>
    <button class="close-btn">Close</button>
  </div>
{/if}

<style>
  .pop-up {
    border: 1px solid black;
    position: fixed;
    width: 200px;
    height: 200px;
    top: 10px;
    right: 10px;
  }
</style>
