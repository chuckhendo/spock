(function(){

	var StorageService = function(){};

	var p = StorageService.prototype;

	p.setProjects = function (projects)
	{
		localStorage.SpockData = JSON.stringify(projects);
	};

	p.getProjects = function()
	{
		try
		{
			var projects = JSON.parse(localStorage.SpockData || '[]');
		} catch (e) {
			window.alert('Error Reading Spock ! Reverting to defaults.');
		}
		
		return projects || [];
	};

	window.StorageService = StorageService;
	
})();