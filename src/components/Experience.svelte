<script>
    export let experiences;
  </script>
  
  <div class="w-3/4">
    <h2 class="bg-black text-white px-3 py-1 mb-3">Experiences</h2>
    {#each experiences as exp}
      <div class="bg-gray-200 rounded-lg p-4 mb-5">
        <div class="flex justify-between mb-2">
          <h3 class="font-bold">{exp.company}</h3>
          <span class="font-bold">{exp.dates}</span>
        </div>
        <div class="flex justify-between italic mb-3">
          <span>{exp.role}</span>
          <span>{exp.location}</span>
        </div>
        <ul class="list-none p-0">
          {#each exp.responsibilities as responsibility}
            <li>{responsibility}</li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
  