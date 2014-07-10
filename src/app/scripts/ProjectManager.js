(function(){

	var ProjectManager = function()
	{
		this.projects = spock.storageService.getProjects();
	};

	var p = ProjectManager.prototype;

	p.add = function (dir, cb)
	{
		var exist = false;
		_.each(this.projects, function (project){
			if (!path.relative(project.path, dir))
			{
				exist = true;
			}
		});

		// If a project already exists ignore and don't try to reload
		if (exist) return;
		
		var project_name = path.basename(dir);
		var project_id = spock.util.uid(project_name);

		var GruntPath = dir + '/node_modules/grunt/';

		if (!fs.existsSync(GruntPath)) {
			window.alert('Unable to find local grunt.');
			return
		}

		var grunt = require(dir + "/node_modules/grunt/");

		var GruntinitConfigFnPath = grunt.file.findup('Gruntfile.{js,coffee}', {cwd: dir, nocase: true});

		if (GruntinitConfigFnPath === null) {
			window.alert('Unable to find Gruntfile.');
			return
		}

		require(GruntinitConfigFnPath)(grunt);

		var tasks = [];
		_.each(grunt.task._tasks, function (task) {
			tasks.push({
				name: task.name,
				info: task.info.replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
					.replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
					.replace(/"/g, '&quot;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;')
			});
		});

		var project = {
			id: project_id,
			name: project_name,
			path: dir,
			tasks: tasks,
			config: {
			}
		};

		this.projects.push(project);
		spock.storageService.setProjects(this.projects);

		cb(project);		
	};

	p.remove = function(id)
	{
		this.projects = _.reject(this.projects, function(project){
			return project.id === id;
		});

		spock.storageService.setProjects(this.projects);
		spock.terminalManager.killProjectWorkers(id);
	};

	p.getById = function(id)
	{
		return _.find(spock.projectManager.projects, function(project){
			return project.id == id;
		});
	};

	window.ProjectManager = ProjectManager;

})();