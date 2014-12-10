

var Dashboard = function(urlData){
	this.urlData = urlData;
	this.data = [];
	this.openedDashdisp = [];
	this.requestCache = [];
	widgetry.thisD = this;
	
	var thisD = this;
	$(document).ready(function () {
		// Initialize
		thisD.load();
	});
};

/*
	---------------
	LOAD
	---------------
*/

Dashboard.prototype.load = function(){
	var thisD = this;
	$.ajax({
		type: "POST",
		url: thisD.urlData,
		data: {type: 'dashboard', request: 'load'},
		dataType: 'json',
		success: function(result){
			thisD.data = result.data;
			thisD.argList = result.argList;
			thisD.userOptions = result.userOptions;
			thisD.reportTypeList = result.reportTypeList;
			thisD.initialize();
		},
		error: function(error, text){
			console.log(error);
			console.log(error.responseText);
		}
	});
};

Dashboard.prototype.dataRequest = function(request, callback){
	var thisD = this;
	var jsonRequest = JSON.stringify(request);
	var searchRequest = thisD.requestCache.filter(function(cachedRequest){return cachedRequest.json === jsonRequest;})[0];
	// If already requested
	if(typeof searchRequest == 'object'){
		// If already returned
		var callFunc = function(){
			var result = JSON.parse(searchRequest.result);
			callback(result);
		}
		if(typeof searchRequest.result == 'string'){
			callFunc();
		}
		else{
			searchRequest.callList.push(callFunc);
		}
	}
	// If new
	else{
		// Register the request
		searchRequest = {json: jsonRequest, callList: []};
		thisD.requestCache.push(searchRequest);
		// Send the request
		$.ajax({
			type: "POST",
			url: thisD.urlData,
			data: request,
			dataType: 'json',
			success: function(result){
				searchRequest.result = JSON.stringify(result);
				callback(result);
				searchRequest.callList.forEach(function(callFn){ callFn(); });
			},
			error: function(error, text){
				console.log(error);
				console.log(error.responseText);
			}
		});
	}
};

Dashboard.prototype.initialize = function(){
	var thisD = this;
	
	// Typeahead search bar
	thisD.searchTypeahead = [];
	thisD.dashdispList = [];
	thisD.data.forEach(function(dash){
		if(dash.arg == 'none'){
			thisD.searchTypeahead.push(dash.name);
			thisD.dashdispList.push({name: dash.name, dash: dash});
		}
		else{
			// Generate dashdisps
			var argObj = thisD.argList.filter(function(obj){return obj.code == dash.arg;})[0];
			argObj.listData.forEach(function(argValue){
				var name = dash.name.replace('[' + argObj.code + ']', argValue);
				thisD.searchTypeahead.push(name);
				thisD.dashdispList.push({name: name, dash: dash, argObj: argObj, argValue: argValue});
			});
		}
	});
	$('#dash-search-box').typeahead({
		source: thisD.searchTypeahead,
		updater: function(item){
			thisD.displayDashdispFromName(item);
			$('#dash-search-box').val('').blur();
		}
	});
	
	// Event after "ENTER" in the search bar
	$('#dash-search-box').keyup(function(e){
		if(e.keyCode == 13){
			// Search the corresponding dashdisp
			thisD.displayDashdispFromName($('#dash-search-box').val());
			$('#dash-search-box').val('').blur();
		}
	});
	
	// Open saved dashdisp
	if(typeof thisD.userOptions.openedDashdisp == 'object'){
		thisD.userOptions.openedDashdisp.forEach(function(dashdispName){
			thisD.displayDashdispFromName(dashdispName);
		});
		if(thisD.userOptions.openedDashdisp.length > 0){
			thisD.displayDashdispFromName(thisD.userOptions.openedDashdisp[0]);
		}
	}
	
	// Autosave
	thisD.autosave = setInterval(function(){thisD.saveOpenedDashdisp();}, 5000);
	this.modified = false;
};

/*
	---------------
	SAVE
	---------------
*/

Dashboard.prototype.saveOpenedDashdisp = function(){
	var thisD = this;
	if(!thisD.modified){ return true; }
	var list = thisD.openedDashdisp.map(function(obj){ return obj.name; });
	thisD.modified = false;
	$.ajax({
		type: "POST",
		url: thisD.urlData,
		data: {type: 'userOptions', request: 'save', data: {openedDashdisp: list}},
		success: function(result){
			console.log(result);
		}
	});
};

/*
	---------------
	DASHDISP
	---------------
*/

Dashboard.prototype.displayDashdispFromName = function(name){
	var thisD = this;
	var dashdisp = thisD.dashdispList.filter(function(obj){return obj.name == name;})[0];
	if(typeof dashdisp == 'object'){
		// Display the dashdisp
		thisD.displayDashdisp(dashdisp);
	}
};

Dashboard.prototype.displayDashdisp = function(dashdisp){
	var thisD = this;
	
	// Update the tab bar
	$('#dash-tabs-bar li').attr('class', ''); // Desactivate all tabs
	var alreadyOpen = thisD.openedDashdisp.filter(function(obj){return obj == dashdisp;}).length != 0;
	if(!alreadyOpen){
		// Create a tab
		thisD.addTab(dashdisp);
		thisD.openedDashdisp.push(dashdisp);
		thisD.modified = true;
	}
	// Activate the tab
	$('#dash-tabs-bar li').filter(function(index, element){ return $(element).find('.dash-tab-name').text() == dashdisp.name; }).attr('class', 'active');
	
	// Launch packery
	$('#dashContainer').empty().append('<div class="grid-sizer" id="grid-sizer"></div>').packery({
		itemSelector: '.widget',
		columnWidth: '.grid-sizer',
		gutter: 0,
		transitionDuration: '0s'
	});
	
	// Display widgets
	if(typeof dashdisp.dash.widgets == 'object'){
		dashdisp.dash.widgets.sort(function(obj1, obj2){return obj1.order - obj2.order;});		
		dashdisp.dash.widgets.forEach(function(widget, index){ widgetry.displayWidget(widget, dashdisp); });
	}
	$('#dashContainer').packery();
	
	// Mark the dashdisp as current
	thisD.currentDashdisp = dashdisp;
};

Dashboard.prototype.closeDashdisp = function(dashdisp){
	var thisD = this;
	
	// Search the dashdisp
	var index = thisD.openedDashdisp.indexOf(dashdisp);
	if(index < 0){ return true;}
	
	// Remove the tab
	$('#dash-tabs-bar li').filter(function(index, element){ return $(element).find('.dash-tab-name').text() == dashdisp.name; }).remove();
	
	// Remove the dashdisp from opened dashdisp
	thisD.openedDashdisp.splice(index, 1);
	thisD.modified = true;
	
	// Open another dashdisp if the one about to close is open
	if(thisD.currentDashdisp == dashdisp){
		if(typeof thisD.openedDashdisp[index] == 'object'){ thisD.displayDashdisp(thisD.openedDashdisp[index]); }
		else if(typeof thisD.openedDashdisp[index-1] == 'object'){ thisD.displayDashdisp(thisD.openedDashdisp[index-1]); }
		else{ $('#dashContainer').empty(); }
	}
};
		
Dashboard.prototype.addTab = function(dashdisp){
	var thisD = this;
	var newTab = $('<li role="presentation"><a href="#"><span class="dash-tab-name"></span><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button></a></li>');
	newTab.find('.dash-tab-name').text(dashdisp.name);
	newTab.find('a').click(function(){thisD.displayDashdisp(dashdisp);});
	newTab.find('.close').click(function(event){
		event.stopPropagation();
		thisD.closeDashdisp(dashdisp);
		$(document).trigger("click");
	});
	$('#dash-tabs-bar').append(newTab);
};