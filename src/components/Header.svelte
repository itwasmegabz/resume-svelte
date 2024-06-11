<script>
    export let name;
    export let contact;
  </script>
  
  <div class="flex items-center border-b-2 border-black pb-5 mb-5">
    <div class="w-24 h-32 bg-gray-400 mr-5">
      <img src="pabriel.png" alt={name} class="w-full h-full object-cover">
    </div>
    <div class="flex-grow">
      <h1 class="text-2xl font-bold">{name}</h1>
      {#each contact as item}
        <p>{item}</p>
      {/each}
    </div>
  </div>
  