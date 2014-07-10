(function(){

	var TmTSpock = function()
	{
		var self = this;
		if (spock.projectManager.projects.length > 0)
		{
			_.each(spock.projectManager.projects, function(project){
				self.addProjectHTML(project);
				self.switchProject(project.id);

			});
		}
	};

	var p = TmTSpock.prototype;

	p.addProject = function (dir)
	{
		var self = this;
		spock.projectManager.add(dir, function (project){
			self.addProjectHTML(project);
			self.switchProject(project.id);
		});

	};

	p.addProjectHTML = function (project)
	{
		var project_html = spock.util.getTemplate('sidebar_item', project);
		$(project_html).appendTo($('.sidebar-list'));

		var tasks_html = spock.util.getTemplate('tasks', project);
		$(tasks_html).appendTo($('.task-tab'));
	};


	p.switchProject = function (id)
	{
		$('.sidebar-item_current').removeClass('sidebar-item_current');
		$('#project_' + id).addClass('sidebar-item_current');

		$('.tasks').hide();
		$('#tasks_' + id).show();
	};

	p.removeProject = function (id)
	{
		spock.projectManager.remove(id);

		$('#project_' + id).remove();
		$('#tasks_' + id).remove();

		if ($('.sidebar-item_current').length == 0 && spock.projectManager.projects.length > 0)
		{
			this.switchProject(spock.projectManager.projects[0].id);
		}
	};

	p.putCliLog = function(data, project_id, task_name)
	{
		var output = ansi2html(data);
		$('<p>' + output + '</p>').appendTo($('#console_' + project_id + "_" + task_name));
		this.terminalScrollToBottom(project_id, task_name);
	};

	p.terminalScrollToBottom = function(project_id, task_name)
	{
		_.throttle(function(){
			$('#console_' + project_id + "_" + task_name).scrollTop(999999999);
		}, 100)();
	};

	p.runTask = function(project_id, task_name)
	{
		spock.terminalManager.runTask(project_id, task_name, function(){
			//start event
			$('#task_item_' + project_id + "_" + task_name).addClass('tasks-item_running');
			$('#task_item_' + project_id + "_" + task_name).removeClass('tasks-item_error');

			$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_terminal").show();
			$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_stop").show();
			$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_run").hide();
		}, function(){
			//end event

			$('#task_item_' + project_id + "_" + task_name).removeClass('tasks-item_running');
			$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_terminal").hide();
			$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_stop").hide();
			$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_run").show();

		}, function(){
			//error event
			$('#task_item_' + project_id + "_" + task_name).addClass('tasks-item_error');

			$('#task_item_' + project_id + "_" + task_name).removeClass('tasks-item_running');
			$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_terminal").hide();
			$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_stop").hide();
			$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_run").show();

		});
	};

	p.stopTask = function(project_id, task_name)
	{
		spock.terminalManager.stopTask(project_id, task_name);

		$('#task_item_' + project_id + "_" + task_name).removeClass('tasks-item_running');
		$('#task_item_' + project_id + "_" + task_name).removeClass('tasks-item_error');

		$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_terminal").hide();
		$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_stop").hide();
		$('#task_item_' + project_id + "_" + task_name + " .tasks-action-item_run").show();

	};

	window.TmTSpock = TmTSpock;

})();