(function(){

	// Import node modules
	var ansi2html = require('ansi2html');
	var watch = require('node-watch');

	/**
	*  The main application
	*  @class Spock
	*/
	var Spock = function()
	{
		var self = this;
		if (spock.projectManager.projects.length > 0)
		{
			var activeId = spock.storageService.activeProject;
			var foundActive = false;
			var firstId;
			_.each(
				spock.projectManager.projects, 
				function(project)
				{
					if (!firstId)
					{
						firstId = project.id;
					}
					project = spock.projectManager.add(project.path);

					if (project) 
					{
						self.addProjectHTML(project);
						self.watchProject(project.path);
					}
					lastId = project.id;
					if (activeId && project.id == activeId)
					{
						foundActive = true;
					}
				}
			);
			// If the active project isn't found
			// so we'll use the first project in the list
			if (!foundActive)
			{
				activeId = firstId;
			}
			this.switchProject(activeId);
		}
	};

	// Reference to the prototype
	var p = Spock.prototype = {};

	/**
	*  Add a project to the list of projects
	*  @method addProject
	*  @param {string} dir The directory of the project to load
	*/
	p.addProject = function(dir)
	{
		var project = spock.projectManager.add(dir);

		if (project) 
		{
			this.addProjectHTML(project);
			this.switchProject(project.id);
			this.watchProject(project.path);
		}
	};

	/**
	*  Check to see if a file changed
	*  @method watchProject
	*  @param {string} projectPath The project path to watch
	*/
	p.watchProject = function(path)
	{
		var self = this;
		watch(
			path + "/Gruntfile.js", 
			function()
			{
				var project = spock.projectManager.getByPath(path);
				if (!project)
				{
					console.error("No project found matching " + path);
					return;
				}
				self.removeProject(project.id);
				self.addProject(path);
			}
		);
	};

	/**
	*  Add the project to the interface
	*  @method addProjectHTML
	*  @param {object} project The project properties
	*/
	p.addProjectHTML = function(project)
	{
		this.clearProject(project.id);

		var project_html = Utils.getTemplate('sidebar_item', project);
		$(project_html).appendTo($('.sidebar-list'));

		var tasks_html = Utils.getTemplate('tasks', project);
		$(tasks_html).appendTo($('.task-tab'));
	};

	/**
	*  Switch view to another project
	*  @method switchProject
	*  @param {String} id The unique project id
	*/
	p.switchProject = function(id)
	{
		$('.sidebar-item_current').removeClass('sidebar-item_current');
		$('#project_' + id).addClass('sidebar-item_current');

		$('.tasks').hide();
		$('#tasks_' + id).show();

		// Save the current project
		spock.storageService.activeProject = id;
	};

	/**
	*  Clear the project from the display
	*  @method clearProject
	*  @param {String} id The unique project id
	*/
	p.clearProject = function (id)
	{
		$('#project_' + id).remove();
		$('#tasks_' + id).remove();
	};

	/**
	*  Remove a project
	*  @method removeProject
	*  @param {String} id The unique project id
	*/
	p.removeProject = function(id)
	{
		spock.projectManager.remove(id);

		this.clearProject(id);

		if ($('.sidebar-item_current').length == 0 && spock.projectManager.projects.length > 0)
		{
			this.switchProject(spock.projectManager.projects[0].id);
		}
	};

	/**
	*  Put the commandline log into the terminal window
	*  @method putCliLog
	*  @param {String} data The log data to add
	*  @param {String} project_id The unqiue project id
	*  @param {String} task_name The name of the task
	*/
	p.putCliLog = function(data, project_id, task_name)
	{
		var output = ansi2html(data);
		$('<p>' + output + '</p>').appendTo($('#console_' + project_id + "_" + task_name));
		this.terminalScrollToBottom(project_id, task_name);
	};

	/**
	*  Scroll to the bottom of the console output
	*  @method terminalScrollToBottom
	*  @param {String} project_id The unqiue project id
	*  @param {String} task_name The name of the task
	*/
	p.terminalScrollToBottom = function(project_id, task_name)
	{
		_.throttle(function(){
			$('#console_' + project_id + "_" + task_name).scrollTop(999999999);
		}, 100)();
	};

	/**
	*  Start running a task
	*  @method runTask
	*  @param {String} project_id The unqiue project id
	*  @param {String} task_name The name of the task
	*/
	p.runTask = function(project_id, task_name)
	{
		spock.terminalManager.runTask(
			project_id,
			task_name,
			function()
			{
				//start event
				$('#task_item_' + project_id + "_" + task_name).addClass('tasks-item_running');
				$('#task_item_' + project_id + "_" + task_name).removeClass('tasks-item_error');
				$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_terminal").show();
				$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_stop").show();
				$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_run").hide();
			}, 
			function()
			{
				//end event
				$('#task_item_' + project_id + "_" + task_name).removeClass('tasks-item_running');
				$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_terminal").hide();
				$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_stop").hide();
				$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_run").show();
			}, 
			function()
			{
				//error event
				$('#task_item_' + project_id + "_" + task_name).addClass('tasks-item_error');
				$('#task_item_' + project_id + "_" + task_name).removeClass('tasks-item_running');
				$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_terminal").hide();
				$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_stop").hide();
				$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_run").show();
			}
		);
	};

	/**
	*  Stop the task
	*  @method stopTask
	*  @param {String} project_id The unqiue project id
	*  @param {String} task_name The name of the task 
	*/
	p.stopTask = function(project_id, task_name)
	{
		spock.terminalManager.stopTask(project_id, task_name);
		$('#task_item_' + project_id + "_" + task_name).removeClass('tasks-item_running');
		$('#task_item_' + project_id + "_" + task_name).removeClass('tasks-item_error');
		$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_terminal").hide();
		$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_stop").hide();
		$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_run").show();
	};

	// Assign to the global space
	window.Spock = Spock;

})();