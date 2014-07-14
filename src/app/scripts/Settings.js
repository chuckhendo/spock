(function(){

	/**
	*  For storing and retrieving data
	*  @class Settings
	*/
	var Settings = function(){};

	// Reference to the prototype
	var p = Settings.prototype;

	/**
	*  Save the window settings
	*  @method saveWindow
	*  @param {Window} win Node webkit window object
	*  @param {Boolean} [isTerminal=false] If we're setting the terminal window 
	*/
	p.saveWindow = function(win, isTerminal)
	{
		var type = !!isTerminal ? 'SpockDataTerminalWindow' : 'SpockDataWindow';
		localStorage[type] = JSON.stringify({
			width : win.width,
			height : win.height,
			x : win.x,
			y : win.y
		});
	};

	/**
	*  Get the current active project
	*  @property {String} activeProject
	*/
	Object.defineProperty(p, "activeProject", {
		get : function()
		{
			return localStorage.SpockDataActive || null;
		},
		set : function(projectId)
		{
			localStorage.SpockDataActive = projectId;
		}
	});

	/**
	*  If the sidebar is collapsed or not
	*  @property {Boolean} collapsedSidebar
	*/
	Object.defineProperty(p, "collapsedSidebar", {
		get : function()
		{
			return JSON.parse(localStorage.SpockDataSidebar || "false");
		},
		set : function(collapsed)
		{
			localStorage.SpockDataSidebar = JSON.stringify(collapsed);
		}
	});

	/**
	*  Load the window to the saved size
	*  @method loadWIndow
	*  @param {Window} win The GUI window object
	*  @param {Boolean} [isTerminal=false] If we're setting the terminal window 
	*/
	p.loadWindow = function(win, isTerminal)
	{
		var rect;
		var type = !!isTerminal ? 'SpockDataTerminalWindow' : 'SpockDataWindow';

		try
		{
			rect = JSON.parse(localStorage[type] || 'null');
		}
		catch(e)
		{
			alert('Error Reading Spock Window! Reverting to defaults.');
		}
		if (rect)
		{
			win.width = rect.width;
			win.height = rect.height;
			win.x = rect.x;
			win.y = rect.y;
		}
	};

	/**
	*  Save the collection of projects
	*  @method setProjects
	*  @param {Array} project The projects to set
	*/
	p.setProjects = function(projects)
	{
		localStorage.SpockData = JSON.stringify(projects);
	};

	/**
	*  Get the projects
	*  @method getProjects
	*  @return {Array} The collection of projects
	*/
	p.getProjects = function()
	{
		var projects;
		try
		{
			projects = JSON.parse(localStorage.SpockData || '[]');
		}
		catch(e)
		{
			alert('Error Reading Spock ! Reverting to defaults.');
		}
		return projects || [];
	};

	// Assign to global space
	window.Settings = Settings;
	
})();