(function(){

	/**
	*  Add projects to the interface
	*  @class ProjectManager
	*/
	var ProjectManager = function()
	{
		/**
		*  The collection of currently loaded projects
		*  @property {Array} projects
		*/
		this.projects = spock.settings.getProjects();
	};

	// The reference to the prototype
	var p = ProjectManager.prototype = {};

	/**
	*  Add a project to the interface
	*  @method add
	*  @param {String} dir The directory of project file
	*  @param {Object|Null} The project if doesn't already exists
	*/
	p.add = function(dir)
	{
		var exists = false;
		_.each(
			this.projects,
			function(project)
			{
				if (!path.relative(project.path, dir))
				{
					exists = project;
				}
			}
		);

		// If the project already exists in the view, 
		// then we clear the existing one and try to reload it
		if (exists)
		{
			this.clear(exists.id);
		}
		// Create new project name and id for new projects
		var projectName = path.basename(dir);
		var projectId = Utils.uid(projectName);

		// Check for grunt within project
		var gruntPath = dir + '/node_modules/grunt/';
		if (!fs.existsSync(gruntPath))
		{
			alert('Unable to find local grunt.');
			return null;
		}

		// Get the local grunt
		var grunt = require(gruntPath);
		var gruntFile = dir + '/Gruntfile.js';

		// Check for grunt file
		if (!fs.existsSync(gruntFile))
		{
			alert('Unable to find Gruntfile.js.');
			return null;
		}

		// Import the gruntfile module.exports
		global.require(gruntFile)(grunt);

		var tasks = [];
		_.each(grunt.task._tasks,
			function(task)
			{
				tasks.push({
					name: task.name,
					info: task.info.replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
						.replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
						.replace(/"/g, '&quot;')
						.replace(/</g, '&lt;')
						.replace(/>/g, '&gt;')
				});
			}
		);

		// The project to return
		var project;

		// Just update the tasks list
		if (exists)
		{
			project = exists;
			project.tasks = tasks;
		}
		// Create a new project and add it to the list of projects
		else
		{
			project = {
				id: projectId,
				name: projectName,
				path: dir,
				tasks: tasks
			};

			// Update the projects
			this.projects.push(project);
			spock.settings.setProjects(this.projects);
		}
		return project;
	};

	/**
	*  Clear the cache for a current project
	*  @method clear
	*  @param {String} id The unique project id
	*/
	p.clear = function(id)
	{
		var project = this.getById(id);

		// Clear the cache for all of the 
		// grunt related files for this 
		if (project)
		{
			var Module = require('module');
			_.each(Module._cache,
				function(value, key)
				{
					if (key.indexOf(project.path) === 0)
					{
						delete Module._cache[key];
					}
				}
			);
		}
	};

	/**
	*  Reorder the project
	*  @method reorder
	*  @param {Array} ids The new collection of ids
	*/
	p.reorder = function(ids)
	{
		var projects = [];
		for (var i = 0; i < ids.length; i++)
		{
			projects.push(this.getById(ids[i]));
		}
		this.projects = projects;
		spock.settings.setProjects(this.projects);
	};

	/**
	*  Remove a project from the interface
	*  @method remove
	*  @param {string} id The unique project id
	*/
	p.remove = function(id)
	{
		this.clear(id);

		// Removing from the list of projects
		this.projects = _.reject(
			this.projects,
			function(project)
			{
				return project.id === id;
			}
		);

		// Update projects
		spock.settings.setProjects(this.projects);

		// Kill all project related tasks
		spock.terminalManager.killProjectWorkers(id);
	};

	/**
	*  Get a project by id
	*  @method getById
	*  @param {string} id The unique project id
	*  @return {object} The project
	*/
	p.getById = function(id)
	{
		return _.find(
			spock.projectManager.projects,
			function(project)
			{
				return project.id === id;
			}
		);
	};

	/**
	*  Get a project by id
	*  @method getById
	*  @param {string} path The unique project path
	*  @return {object} The project
	*/
	p.getByPath = function(path)
	{
		return _.find(
			spock.projectManager.projects,
			function(project)
			{
				return project.path === path;
			}
		);
	};

	// Assign to the global space
	window.ProjectManager = ProjectManager;

})();