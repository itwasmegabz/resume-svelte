<script>
	import Header from './components/Header.svelte';
	import Experience from './components/Experience.svelte';
	import Education from './components/Education.svelte';
	import Skills from './components/Skills.svelte';
	import Interests from './components/Interests.svelte';
	import Associations from './components/Associations.svelte';
  
	let headerData = {
	  name: "Gabriel Zerguit",
	  contact: ["0652387486", "gabriel@grailcavern.com", "125 Pvenue Pharles pe Paulle, 92200, Peuilly-pur-Peine"]
	};
  
	let experiences = [
	  {
		company: "Vinci Concessions",
		dates: "Aug. 2023 – Jan. 2024",
		role: "M&A Analyst Intern",
		location: "La Defense, France",
		responsibilities: [
		  "Collaborated with top management to implement corporate strategy through targeted acquisitions and greenfield projects",
		  "Identified and evaluated new opportunities, conducting preliminary strategic analyses in tandem with Project Directors",
		  "Engaged in project collaborations with both internal and external industrial partners, as well as financial stakeholders. Developed robust implementation cases and structured strategic partnerships effectively",
		  "Provided comprehensive support to Project Managers and Directors across various project facets – from strategic and financial to operational and legal dimensions"
		]
	  },
	  {
		company: "KShuttle",
		dates: "Nov. 2022",
		role: "Consulting Intern",
		location: "Levallois-Perret, France",
		responsibilities: [
		  "Assisted the Director of Consulting and worked closely with a team of consultants to provide strategic solutions for clients in their digital transformation"
		]
	  },
	  {
		company: "GrailCavern.com",
		dates: "Mar. 2020 – Present",
		role: "Founder",
		location: "Paris, France",
		responsibilities: [
		  "As the founder of GrailCavern.com in Paris, France, I played a crucial role in the development and success of a marketplace for reselling collectible toys. The platform has garnered over 80,000 monthly visits and nearly $200,000 in transactions since its inception"
		]
	  }
	];
  
	let education = [
	  {
		institution: "ESSEC Business School",
		dates: "Aug. 2022 – 2025",
		degree: "Master in Management",
		location: "Cergy, France",
		details: [
		  "Advanced Mathematics, Python Programming, Physics as part of a dual degree program with Grande Ecole CentraleSupélec",
		  "Corporate Finance",
		  "Financial Modeling and Accounting",
		  "Business Valuation",
		  "Business Law/Corporate Law"
		]
	  },
	  {
		institution: "Intégrale : Institut d’enseignement supérieur privé",
		dates: "Aug. 2019 – Aug. 2022",
		degree: "Preparatory classes dedicated to national competitive entrance exams",
		location: "Paris, France",
		details: [
		  "Co-admitted to ENS-Paris-Saclay (ranked 7th among all candidates) and ESSEC Business School for the year 2022"
		]
	  },
	  {
		institution: "Auckland Grammar School",
		dates: "Jul 2018 – Dec. 2018",
		degree: "International Student",
		location: "Auckland, New Zealand",
		details: [
		  "Received a $15,000 ’Follow the Kiwi’ scholarship for pursuing studies in New Zealand"
		]
	  }
	];
  
	let skills = [
	  { skill: 'L<span class="text-xs">A</span>T<span class="text-lg">E</span>X', level: 90 },
	  { skill: 'Python', level: 85 },
	  { skill: 'Django', level: 80 },
	  { skill: 'HTML', level: 95 },
	  { skill: 'CSS', level: 90 },
	  { skill: 'MS Office', level: 75 },
	  { skill: 'PowerPoint', level: 85 },
	  { skill: 'Excel', level: 80 },
	];
  
	let interests = [
	  'Programming',
	  'Music',
	  'Composition',
	  'Writing',
	  'Painting',
	  'Videography'
	];
  
	let associations = [
	  {
		name: "Tech ESSEC",
		dates: "Nov. 2022 – Present",
		role: "Active member",
		location: "Paris, France",
		details: [
		  "Contributed to the development of the Salmon-AI project, a finalist in the ’EY Assos Award’ and awarded 1,000 euros by Alten. This project employs AI to supplant traditional fish counting methods like electrofishing, making it non-invasive and safer for the fish."
		]
	  },
	  {
		name: "ESSEC Africa Society",
		dates: "Oct. 2022 – Present",
		role: "Active member",
		location: "Paris, France",
		details: [
		  "Consulting for small African companies",
		  "Organizing round-table discussions with influential African leaders",
		  "Seeking partnerships with businesses and universities"
		]
	  },
	  {
		name: "Les Fermes d’Espoir CFDJ",
		dates: "Oct. 2022 – Nov. 2022",
		role: "Volunteer",
		location: "Paris, France",
		details: [
		  "Assisted in Les Fermes d’Espoir CFDJ’s relocation and developed partnerships in Paris, while facilitating youth reintegration through community service and cultural exposure"
		]
	  }
	];
  </script>
  
  <main class="max-w-2xl mx-auto p-5 bg-white border-2 border-black shadow-lg">
	<Header name={headerData.name} contact={headerData.contact} />
	<Education {education} />
	<Experience {experiences} />
	<Skills />
	<Interests />
	<Associations {associations} />
  </main>
  