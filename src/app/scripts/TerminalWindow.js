(function(){

	/**
	*  The Terminal Window manages the output of a task into it's own console window
	*  @class TerminalWindow
	*  @constructor
	*  @param {String} projectId The unqiue project id
	*  @param {String} taskName The task name
	*/
	var TerminalWindow = function(projectId, taskName)
	{
		/**
		*  The unique project id
		*  @property {String} projectId
		*/
		this.projectId = projectId;

		/**
		*  The name of the task
		*  @property {String} taskName
		*/
		this.taskName = taskName;

		/**
		*  The jQuery node for the task output
		*  @property {jquery} output
		*/
		this.output = null;

		/**
		*  The DOM element on the output window
		*  @property {DOM} terminal
		*/
		this.terminal = null;

		/**
		*  Reference to the nodejs window
		*  @property {Window} nodeWindow
		*/
		this.nodeWindow = null;

		/**
		*  The observer to watch changes in the output
		*  @property {MutationObserver} observer
		*/
		this.observer = null;

		// create the new window
		this.create();
	};

	// Reference to the prototype
	var p = TerminalWindow.prototype = {};

	/**
	*  Open the dialog
	*  @method create
	*/
	p.create = function()
	{
		// Open the new window
		this.nodeWindow = require('nw.gui').Window.get(
			window.open('./terminal.html', {
				show : false
			})
		);
		this.nodeWindow.on('close', this.close.bind(this));
		this.nodeWindow.on('loaded', this.onLoaded.bind(this));
	};

	/**
	*  Open after the DOM is loaded on the new window
	*  @method onLoaded
	*/
	p.onLoaded = function()
	{
		spock.settings.loadWindow(this.nodeWindow, true);

		// Get the dom output
		this.terminal = this.nodeWindow.window.document.getElementById('terminal');

		// Setup the observer
		this.observer = new MutationObserver(this.onUpdate.bind(this));

		// Open the constructor task
		this.open(this.projectId, this.taskName);
	};

	/**
	*  Everytime the output is updated
	*  @method onUpdate
	*  @private
	*/
	p.onUpdate = function()
	{
		this.terminal.innerHTML = this.output.innerHTML;

		// Scroll to the bottom of the output window
		this.terminal.scrollTop = this.terminal.scrollHeight;
	};

	/**
	*  New
	*  @method open
	*  @param {String} projectId The unqiue project id
	*  @param {String} taskName The task name
	*/
	p.open = function(projectId, taskName)
	{
		if (this.observer)
		{
			this.observer.disconnect();
		}
		this.terminal.innerHTML = "";

		this.projectId = projectId;
		this.taskName = taskName;
		this.output = document.getElementById('console_' + projectId + "_" + taskName);
		
		// Update the title
		this.nodeWindow.title = this.taskName;

		// define what element should be observed by the observer
		// and what types of mutations trigger the callback
		this.observer.observe(this.output, {
			attributes: true,
			childList: true,
			characterData: true
		});
		this.onUpdate();

		// Reveal the window
		this.nodeWindow.show();
		this.nodeWindow.focus();
	};

	/**
	*  Close the window
	*  @method close
	*  @private
	*/
	p.close = function()
	{
		if (this.observer)
		{
			this.observer.disconnect();
		}
		this.output = null;
		this.terminal.innerHTML = "";
		spock.settings.saveWindow(this.nodeWindow, true);
		this.nodeWindow.hide();
	};

	/**
	*  Destroy and don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		this.close();
		this.observer = null;
		this.terminal = null;
		this.nodeWindow.close(true);
		this.nodeWindow = null;
	};

	// Assign to global space
	window.TerminalWindow = TerminalWindow;

}());