<script>
    import { onMount } from 'svelte';
    import { Bar } from 'svelte-chartjs';
    import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
    ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);
  
    let skills = [
      { skill: 'HTML', level: 90 },
      { skill: 'CSS', level: 85 },
      { skill: 'JavaScript', level: 75 },
      // Add more skills
    ];
  
    let chartData = {
      labels: skills.map(s => s.skill),
      datasets: [
        {
          label: 'Skill Level',
          data: skills.map(s => s.level),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
  
    let chartOptions = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };
  </script>
  
  <div class="w-full">
    <h2 class="bg-black text-white px-3 py-1 mb-3">Skills</h2>
    <Bar {chartData} {chartOptions} />
  </div>
  