<script>
  import { presidents } from "../data/presidentsData";
  const currentYear = new Date().getFullYear();
  let totalDots = currentYear - $presidents[0].birthYear;
  console.log(totalDots);
</script>

<div>
  <svg width="100%" height="100%">
    <line
      x1="50%"
      y1="0%"
      x2="50%"
      y2="100%"
      stroke="black"
      stroke-width="2"
      class="mobile-line"
    />
    <line
      x1="0%"
      y1="50%"
      x2="100%"
      y2="50%"
      stroke="black"
      stroke-width="2"
      class="desktop-line"
    />
  </svg>
</div>

<style>
  div {
    font-size: 18px;
    background-color: lightblue;
    position: sticky;
    bottom: 0;
    z-index: 10;
    border: 1px solid black;
    width: 100vw;
    height: 45px;
  }
  .mobile-line {
    display: none;
  }

  .desktop-line {
    display: block;
  }

  @media (max-width: 768px) {
    div {
      position: fixed;
      top: 0;
      right: 0;
      width: auto;
      height: 100vh;
      padding: 20px;
      width: 45px;
    }
    .desktop-line {
      display: none;
    }

    .mobile-line {
      display: block;
    }
  }
</style>
