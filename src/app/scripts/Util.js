(function(){

	var Util = function(){};

	var p = Util.prototype;

	p.getTemplate = function(templateFileName, obj)
	{
		if (!window.spock["templates"][templateFileName])
		{
			var template = fs.readFileSync(
				"./app/templates/" + templateFileName + ".html", 
				{encoding: "utf-8"}
			);

			window.spock["templates"][templateFileName] = template;
			return _.template(template)(obj);
		} 
		else 
		{
			return _.template(window.spock["templates"][templateFileName])(obj);
		}
	};

	p.uid = function(str)
	{
		return md5((new Date().toISOString() + str)
			.toLowerCase()
			.replace(/\\/gi, '/'))
			.substr(8, 8);
	};

	window.Util = Util;

})();