// Global node modules
var fs = require('fs');
var path = require("path");

$(function(){

	// Import node modules
	var gui = require('nw.gui');
	var winMain = gui.Window.get();
	var terminal = null;

	//spock app
	window.spock = {};
	window.spock.settings = new Settings();
	window.spock.projectManager = new ProjectManager();
	window.spock.terminalManager = new TerminalManager();
	window.spock.app = new Spock();

	var sidebarClass = 'collapsed-sidebar';

	var body = $('body').on(
		'click',
		'.JS-Sidebar-Item',
		function()
		{
			spock.app.switchProject($(this).attr('data-id'));
			return false;
		}
	)
	.on(
		'click',
		'.JS-Project-Remove',
		function()
		{
			spock.app.removeProject($(this).attr('data-id'));
			return false;
		}
	)
	.on(
		'click',
		'.JS-Task-Toggle-Info',
		function()
		{
			$(this).find('.tasks-item-info').toggle();
			return false;
		}
	)
	.on(
		'click',
		'.JS-Task-Run',
		function()
		{
			var project_id = $(this).attr('data-project-id');
			var task_name = $(this).attr('data-task-name');
			spock.app.runTask(project_id, task_name);
			return false;
		}
	)
	.on(
		'click',
		'.JS-Task-Terminal',
		function(e)
		{
			var projectId = $(this).attr('data-project-id');
			var taskName = $(this).attr('data-task-name');

			if (!terminal)
			{
				terminal = new TerminalWindow(projectId, taskName);
			}
			else
			{
				terminal.open(projectId, taskName);
			}
			return false;
		}
	)
	.on(
		'click',
		'.JS-Task-Stop',
		function()
		{
			var project_id = $(this).attr('data-project-id');
			var task_name = $(this).attr('data-task-name');
			spock.app.stopTask(project_id, task_name);
			return false;
		}
	);

	$('.sidebar-toggle').click(
		function()
		{
			collapsed = body
				.toggleClass(sidebarClass)
				.hasClass(sidebarClass);

			spock.settings.collapsedSidebar = collapsed;
		}
	);
	if (spock.settings.collapsedSidebar)
	{
		body.addClass(sidebarClass);
	}

	// Enable sortable list
	$('.sidebar-list').sortable().on('sortupdate', function(){
		var ids = [];
		$(".sidebar-item").each(
			function()
			{
				ids.push($(this).data('id'));
			}
		);
		spock.projectManager.reorder(ids);
	});

	$(document).on(
		'dragover',
		function handleDragOver(event)
		{
			event.stopPropagation();
			event.preventDefault();
			console.log("handleDragOver");
			//body.addClass('file-dropping');
		}
	)
	.on(
		'drop',
		function handleDrop(event)
		{
			event.stopPropagation();
			event.preventDefault();
			//console.log("handleDrop");
			//body.removeClass('file-dropping');

			var files = event.originalEvent.dataTransfer.files;

			_.each(files, function(file){

				var stats = fs.statSync(file.path);

				if (stats.isDirectory() && path.dirname(file.path) !== file.path)
				{
					spock.app.addProject(file.path);
				}
				else if (stats.isFile() && path.dirname(path.dirname(file.path)) !== path.dirname(file.path))
				{
					spock.app.addProject(path.dirname(file.path));
				}
			});
			return false;
		}
	);
	
	window.addEventListener(
		'keydown',
		function(e)
		{
			if (e.keyIdentifier === 'F12')
			{
				winMain.showDevTools();
			}
			else if (e.keyIdentifier === 'F5')
			{
				location.reload();
			}
		}
	);

	winMain.on(
		'close',
		function()
		{
			if (terminal)
			{
				terminal.destroy();
			}
			spock.settings.saveWindow(winMain);
			spock.terminalManager.killWorkers();
			gui.App.closeAllWindows();
			gui.App.quit();
		}
	);

	// Load the saved window size
	spock.settings.loadWindow(winMain);

	winMain.show();

	spock.app.init();
});