function deepReplace(obj, oldString, newString) {
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        var out = [], i = 0, len = obj.length;
        for ( ; i < len; i++ ) {
            out[i] = arguments.callee(obj[i], oldString, newString);
        }
        return out;
    }
    if (typeof obj === 'object') {
        var out = {}, i;
        for ( i in obj ) {
            out[i] = arguments.callee(obj[i], oldString, newString);
        }
        return out;
    }
	if (typeof obj === 'string') {
		var regExp = new RegExp(oldString, 'g');
		return obj.replace(regExp, newString);
	}
    return obj;
}


var widgetry = {
	list: [
		{name: "Misc Last", id:"miscLast", sizes: ["medium thin", "medium"]},
		{name: "Report Number", id:"reportNumber", sizes: ["small", "medium thin"]},
		{name: "Report Table", id:"reportTable", sizes: ["large thin", "large"]}
	],
	displaySettings: function(widget){
		var type = $('#dash-wg-in-type').val();
		// Common
		var edit = typeof widget !== 'undefined';
		var container = $('#dash-modal-settings-body');
		// __Size
		container.append('<hr><h4>Size</h4><select class="form-control" id="dash-wg-in-size"></select>');
		widgetry[type].sizes.forEach(function(size){ $('#dash-wg-in-size').append($('<option></option>').attr('value',size).text(size)); });
		$('#dash-wg-in-size').prop("selectedIndex", -1);
		if(edit){$('#dash-wg-in-size').val(widget.size);}
		// __Title
		container.append('<h4>Title</h4><input type="text" class="form-control" id="dash-wg-in-title" placeholder="Title">');
		if(edit){$('#dash-wg-in-title').val(widget.title);}
		// Specific
		typeof widgetry[type].displaySettings == 'function' ? widgetry[type].displaySettings(widget) : null;
	},
	canSaveWidget: function(){
		var type = $('#dash-wg-in-type').val();
		// Common
		if(!($('#dash-wg-in-size').val())){ return 'You must specify a size.'; }
		if(!($('#dash-wg-in-title').val())){ return 'You must specify a title.'; }
		// Specific
		return (typeof widgetry[type].canSaveWidget == 'function' ? widgetry[type].canSaveWidget() : true);
	},
	editWidget: function(widget){
		var type = $('#dash-wg-in-type').val();
		// Common
		widget.type = type;
		widget.size = $('#dash-wg-in-size').val();
		widget.title = $('#dash-wg-in-title').val();
		// Specific
		typeof widgetry[type].editWidget == 'function' ? widgetry[type].editWidget(widget) : null;
		// Show
		widgetry.showWidget(widget);
	},
	showWidget: function(widget){
		var type = widget.type;
		var element = $('#dashContainer .widget').filter(function(index, elmt){ return $(elmt).attr('widgetid') == widget.id; })[0];
		// Create a new if doesn't exist
		if(typeof element == 'undefined'){
			element = document.createElement('div');
			$(element).attr('class', 'widget ' + widget.size).attr('widgetid', widget.id).append('<div class="widget-content"></div>');
			$('#dashContainer').append(element).packery('addItems', element);
			widgetry.adjustCSS();
		}
		// Update element content
		$(element).attr('class', 'widget ' + widget.size);
		$(element).find('.widget-content').empty().append('<div class="show-settings"><span class="glyphicon glyphicon-cog" aria-hidden="true"></span><span class="sr-only">Settings</span></div>').find('.show-settings').click(function(){ widgetry.thisDA.showModalWidget(widget); });
		// Show title
		$(element).find('.widget-content').append($('<p class="title"></p>').text(widget.title));
		// Specific
		typeof widgetry[type].showWidget == 'function' ? widgetry[type].showWidget(widget, element) : null;
	},
	displayWidget: function(widget, dashdisp){
		var type = widget.type;
		var element = $('#dashContainer .widget').filter(function(index, elmt){ return $(elmt).attr('widgetid') == widget.id; })[0];
		// Create a new if doesn't exist
		if(typeof element == 'undefined'){
			element = document.createElement('div');
			$(element).attr('class', 'widget ' + widget.size).attr('widgetid', widget.id).append('<div class="widget-content"></div>');
			$('#dashContainer').append(element).packery('addItems', element);
			widgetry.adjustCSS();
		}
		// Replace argument
		if(typeof dashdisp.argObj == 'object'){
			var thisWidget = deepReplace(widget, '\\[' + dashdisp.argObj.code + '\\]', dashdisp.argValue);
		}
		else{
			var thisWidget = widget;
		}
		// Specific
		typeof widgetry[type].displayWidget == 'function' ? widgetry[type].displayWidget(thisWidget, dashdisp, element) : null;
	},
	adjustCSS: function(){
		var size = (0.12*$('#grid-sizer').width()).toString() + 'px';
		$('.widget-content').css({'font-size': size});
	}
};

widgetry.list.forEach(function(type){ widgetry[type.id] = type; });

$( window ).resize(function() {
	widgetry.adjustCSS();
});

// Filter

widgetry.displayFilterSettings = function(container, reportType){
	container.append('<h5>Filters</h5><textarea class="form-control" rows="4" id="dash-wg-in-filter" style="font-family:monospace;"></textarea>');
	var helper = "<p>This Javascript executable code must return a boolean value. You can use as variables all entry's values: ";
	reportType.columns.forEach(function(col, id){ if(id>0){ helper += ', '; } helper += '<code>entry.' + col.data + '</code>'; });
	helper += ', and the current user login: <code>login</code>.</p>';
	helper += '<p>You can use <a href="http://momentjs.com/docs/" target="_blank">Moment.js</a> to manipulate dates.</p>';
	container.append(helper);
};

widgetry.filter = function(widget, entry){
	// Get user login
	var login = widgetry.thisD.userOptions.login;
	// Evaluate the filter code
	if(typeof widget.filter != "string" || widget.filter == ''){ return true; }
	else{ var cond = eval(widget.filter); return (typeof cond == "boolean" ? cond : true); }
};

/*
	------------
	Misc Last
	------------
*/

// Generalities
$(document).click(function(){
	$('.misc-list').popover('hide');
	$('.popover').remove();
});

widgetry.miscLast.displaySettings = function(widget){
	var edit = typeof widget !== 'undefined';
	var container = $('#dash-modal-settings-body');
	// __Tags typeahead
	var typeahead = widgetry.thisDA.miscParam.tagsTypeahead.slice(0);
	if(widgetry.thisDA.current.arg != 'none'){
		typeahead.push('[' + widgetry.thisDA.current.arg + ']');
	}
	// __Tags filters
	container.append('<h4>Tags filter</h4><select multiple id="dash-wg-in-filter"></select>');
	$('#dash-wg-in-filter').tagsinput({
		trimValue: true,
		confirmKeys: [13, 188, 190, 32, 186],
		tagClass: 'label label-default',
		typeahead: {source: typeahead},
		freeInput: false
	});
	$('#dash-wg-in-filter').off().on('itemAdded itemRemoved', function(){
		var placeholder = $('#dash-wg-in-filter').tagsinput('items').length > 0 ? '' : 'Add tags...';
		$('#dash-wg-in-filter input').attr({'placeholder':placeholder});
	});
	// __Number of entries
	container.append('<h4>Number of entries displayed</h4><input type="number" class="form-control" id="dash-wg-in-number">');
	if(edit){
		if(typeof widget.tagsFilters == 'object'){
			widget.tagsFilters.forEach(function(tag){
				$('#dash-wg-in-filter').tagsinput('add', tag);
			});
		}
		$('#dash-wg-in-number').val(widget.numberEntries);
	}
};

widgetry.miscLast.editWidget = function(widget){
	widget.tagsFilters = $('#dash-wg-in-filter').tagsinput('items').slice();
	widget.numberEntries = $('#dash-wg-in-number').val();
};

widgetry.miscLast.showWidget = function(widget, element){
	// __Type
	$(element).find('.widget-content').append($('<p></p>').text(widgetry.miscLast.name));
	// __Number
	var number = typeof widget.numberEntries != "undefined" ? widget.numberEntries : 0;
	$(element).find('.widget-content').append($('<p></p>').html(number + ' entries'));
	// __Tags filters
	var tagsList = $('<p></p>');
	if(typeof widget.tagsFilters == 'object'){
		widget.tagsFilters.forEach(function(tag){ tagsList.append($('<span class="label label-default"></span>').text(tag)).append(' '); });
	}
	$(element).find('.widget-content').append(tagsList);
};

widgetry.miscLast.displayWidget = function(widget, dashdisp, element){
	var miscData;
	// Title
	$(element).find('.widget-content').append($('<p class="title"></p>').html(widget.title));
	// Request data
	widgetry.thisD.dataRequest({type: 'misc', request: 'load', all: true}, function(result){
		// Filter the data
		miscData = result.data.filter(function(entry){
			if(entry.deleted){return false;}
			if(typeof widget.tagsFilters != 'object' || widget.tagsFilters.length == 0){return true;}
			return widget.tagsFilters.every(function(tagFilt){
				if(typeof entry.tags != 'object' || entry.tags.length == 0){return false;}
				return entry.tags.some(function(tag){ return tag == tagFilt; });
			});
		});
		// Sort the data
		miscData.sort(function(obj1, obj2){return obj2.updated_time - obj1.updated_time;});
		// Display the data
		$(element).find('.widget-content').append('<ul>');
		miscData.some(function(entry, index){
			if(!(index < widget.numberEntries)){return true;}
			var entryElmt = $('<li class="misc-list" role="button"></li>').html(entry.title);
			var template = '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div><div class="popover-footer"><p>' + entry.tags.reduce(function(prev, tag){ return prev + '<span class="label label-default">' + tag + '</span> ';}, '') + '</p></div></div>';
			entryElmt.popover({
				title: entry.title,
				content: entry.text,
				container: "body",
				trigger: "manual",
				template: template
			});
			entryElmt.click(function(event){
				event.stopPropagation();
				$('.misc-list').not(entryElmt).popover('hide');
				entryElmt.popover('show');
				$('.popover').click(function(event){event.stopPropagation();});
			});
			$(element).find('.widget-content').append(entryElmt);
		});
		$(element).find('.widget-content').append('</ul>');
	});	
};
		
/*
	------------
	Report Number
	------------
*/

widgetry.reportNumber.displaySettings = function(widget){
	var edit = typeof widget !== 'undefined';
	var container = $('#dash-modal-settings-body');
	
	// __Number format
	container.append('<h5>Number format</h5><input type="text" class="form-control" id="dash-wg-in-numberFormat"><p>Syntax is the one provided by <a href="http://numeraljs.com/" target="_blank">numeral.js</a></p>');
	// __Divisor
	container.append('<h5>Divisor</h5><input type="number" class="form-control" id="dash-wg-in-divisor" value="1"><p>The number computed will be divided by the divisor before being displayed</p>');
	// __Unit
	container.append('<h5>Unit</h5><input type="text" class="form-control" id="dash-wg-in-unit">');
	// __Report type
	container.append('<h5>Report type</h5><select class="form-control" id="dash-wg-in-reportType"></select>');
	widgetry.thisDA.reportTypeList.forEach(function(reportType){ $('#dash-wg-in-reportType').append($('<option></option>').attr('value',reportType.code).text(reportType.name)); });
	$('#dash-wg-in-reportType').prop("selectedIndex", -1);
	// _*_ Dynamic
	$('#dash-wg-in-reportType').off().change(function(){
		$('#dash-wg-in-reportType').nextAll().remove();
		var reportType = widgetry.thisDA.reportTypeList.filter(function(obj){return obj.code == $('#dash-wg-in-reportType').val();})[0];
		// __Column
		container.append('<h5>Column</h5><select class="form-control" id="dash-wg-in-column"></select>');
		reportType.columns.forEach(function(col){ $('#dash-wg-in-column').append($('<option></option>').attr('value',col.data).text(col.data)); });
		$('#dash-wg-in-column').prop("selectedIndex", -1);
		// _*_ Dynamic
		$('#dash-wg-in-column').off().change(function(){
			$('#dash-wg-in-column').nextAll().remove();
			var column = reportType.columns.filter(function(col){ return col.data == $('#dash-wg-in-column').val(); })[0];
			// __Operation
			container.append('<h5>Operation</h5><select class="form-control" id="dash-wg-in-operation"><option value="count">Count</option><option value="countU">Count unique</option></select>');
			if(column.dataType == 'numeric'){
				$('#dash-wg-in-operation').append('<option value="sum">Sum</option><option value="mean">Mean</option>');
			}
			$('#dash-wg-in-operation').prop("selectedIndex", -1);
			// __Filter
			widgetry.displayFilterSettings(container, reportType);
		});
	});
			
	if(edit){
		$('#dash-wg-in-numberFormat').val(widget.numberFormat).trigger('change');
		$('#dash-wg-in-divisor').val(widget.divisor).trigger('change');
		$('#dash-wg-in-unit').val(widget.unit).trigger('change');
		$('#dash-wg-in-reportType').val(widget.reportType).trigger('change');
		$('#dash-wg-in-column').val(widget.column).trigger('change');
		$('#dash-wg-in-operation').val(widget.operation).trigger('change');
		$('#dash-wg-in-filter').val(widget.filter).trigger('change');
	}
};

widgetry.reportNumber.editWidget = function(widget){
	widget.numberFormat = $('#dash-wg-in-numberFormat').val();
	widget.divisor = $('#dash-wg-in-divisor').val();
	widget.unit = $('#dash-wg-in-unit').val();
	widget.reportType = $('#dash-wg-in-reportType').val();
	widget.column = $('#dash-wg-in-column').val();
	widget.operation = $('#dash-wg-in-operation').val();
	widget.filter = $('#dash-wg-in-filter').val();
};

widgetry.reportNumber.showWidget = function(widget, element){
	// __Report Type
	$(element).find('.widget-content').append($('<p></p>').text(widget.reportType));
	// __Operation
	$(element).find('.widget-content').append($('<p></p>').text(widget.operation));
	// __Column
	$(element).find('.widget-content').append($('<p></p>').text(widget.column));
};

widgetry.reportNumber.displayWidget = function(widget, dashdisp, element){
	var reportData, value;
	// Title
	$(element).find('.widget-content').append($('<p class="title"></p>').html(widget.title));
	// Request data
	widgetry.thisD.dataRequest({type: 'report', request: 'load', dataType: widget.reportType, all: true}, function(result){
		// Filter the data
		reportData = result.data.filter(function(entry){
			if(entry.deleted){ return false; }
			return widgetry.filter(widget, entry);
		});
		// Compute the value
		switch(widget.operation){
			case 'count':
				value = reportData.length;
				break;
			case 'countU':
				var count = {};
				reportData.forEach(function(entry){
					count[entry[widget.column]] = (count[entry[widget.column]] || 0) + 1;
				});
				value = Object.keys(count).length;
				break;
			case 'sum':
				value = reportData.reduce(function(prev, entry){ return prev + parseFloat(entry[widget.column]); }, 0);
				break;
			case 'mean':
				value = reportData.reduce(function(prev, entry){ return prev + parseFloat(entry[widget.column]); }, 0) / reportData.length;
				break;
		}
		// Display the value
		var strValue = numeral(value).format(widget.numberFormat);
		$(element).find('.widget-content').append('<p class="widget-number"><span class="widget-number-value">' + strValue + '</span> <span class="widget-number-unit">' + widget.unit + '</span></p>');
	});
};

/*
	------------
	Report Table
	------------
*/

widgetry.reportTable.displaySettings = function(widget){
	var edit = typeof widget !== 'undefined';
	var container = $('#dash-modal-settings-body');
	
	// __Report type
	container.append('<h5>Report type</h5><select class="form-control" id="dash-wg-in-reportType"></select>');
	widgetry.thisDA.reportTypeList.forEach(function(reportType){ $('#dash-wg-in-reportType').append($('<option></option>').attr('value',reportType.code).text(reportType.name)); });
	$('#dash-wg-in-reportType').prop("selectedIndex", -1);
	// _*_ Dynamic
	$('#dash-wg-in-reportType').off().change(function(){
		$('#dash-wg-in-reportType').nextAll().remove();
		var reportType = widgetry.thisDA.reportTypeList.filter(function(obj){return obj.code == $('#dash-wg-in-reportType').val();})[0];
		// __Columns
		container.append('<h5>Columns</h5><select multiple id="dash-wg-in-columns"></select>');
		$('#dash-wg-in-columns').tagsinput({
			trimValue: true,
			confirmKeys: [13, 188, 190, 32, 186],
			tagClass: 'label label-default',
			typeahead: {source: reportType.columns.map(function(obj){return obj.data;})},
			freeInput: false
		});
		$('#dash-wg-in-columns').off().on('itemAdded itemRemoved', function(){
			var placeholder = $('#dash-wg-in-columns').tagsinput('items').length > 0 ? '' : 'Tags...';
			$('#dash-wg-in-columns').next().find('input').attr({'placeholder':placeholder});
		});
		// __Filter
		widgetry.displayFilterSettings(container, reportType);
	});
			
	if(edit){
		$('#dash-wg-in-reportType').val(widget.reportType).trigger('change');
		$('#dash-wg-in-columns').val(widget.column).trigger('change');
		if(typeof widget.columns == 'object'){
			widget.columns.forEach(function(col){
				$('#dash-wg-in-columns').tagsinput('add', col);
			});
		}
		$('#dash-wg-in-filter').val(widget.filter).trigger('change');
	}
};

widgetry.reportTable.editWidget = function(widget){
	widget.reportType = $('#dash-wg-in-reportType').val();
	widget.columns = $('#dash-wg-in-columns').tagsinput('items').slice();
	widget.filter = $('#dash-wg-in-filter').val();
};

widgetry.reportTable.showWidget = function(widget, element){
	// __Report Type
	$(element).find('.widget-content').append($('<p></p>').text(widget.reportType));
	// __Columns
	var tagsList = $('<p></p>');
	if(typeof widget.columns == 'object'){
		widget.columns.forEach(function(col){ tagsList.append($('<span class="label label-default"></span>').text(col)).append(' '); });
	}
	$(element).find('.widget-content').append(tagsList);
};

widgetry.reportTable.displayWidget = function(widget, dashdisp, element){
	var reportData, columnsIndex;
	var reportType = widgetry.thisD.reportTypeList.filter(function(obj){return obj.code == widget.reportType;})[0];
	// Title
	$(element).find('.widget-content').append($('<p class="title"></p>').html(widget.title));
	// Request data
	widgetry.thisD.dataRequest({type: 'report', request: 'load', dataType: widget.reportType, all: true}, function(result){
		// Filter the data
		reportData = result.data.filter(function(entry){
			if(entry.deleted){ return false; }
			return widgetry.filter(widget, entry);
		});
		// Select the columns
		columnsIndex = widget.columns.map(function(col){
			var index;
			reportType.columns.some(function(obj, id){
				if(obj.data == col){
					index = id;
					return true;
				}
				return false;
			})
			return index;
		})
		// Display the table
		$(element).find('.widget-content').append('<div class="handsontable-container"></div>');
		$(element).find('.handsontable-container').handsontable({
			data: reportData,
			minSpareRows: 0,
			colHeaders: columnsIndex.map(function(id){ return reportType.columnsHeader[id]; }),
			columnSorting: true,
			stretchH: 'all',
			columns: columnsIndex.map(function(id){ reportType.columns[id].readOnly = true; return reportType.columns[id]; }),
			afterSelection: function(r, c, r2, c2){
				if(r != r2 || c != c2){ $('.popover').remove(); return true;}
				// Popover with additional info
				var handler = $(element).find('.handsontable-container').handsontable('getInstance');
				var dbId = handler.getDataAtRowProp(r, 'dbId');
				var entry = reportData.filter(function(obj){ return obj.dbId == dbId; })[0];
				var row = handler.getCell(r, c).parentElement;
				// Popover content
				var content = '<table class="table table-striped table-condensed popover-table">';
				reportType.columns.forEach(function(col, id){ content += '<tr><td>' + reportType.columnsHeader[id] + '</td><td>' + (entry[col.data] || '') + '</td></tr>'; });
				content += '<tr><td>Last update by</td><td>' + (entry.updatedUser || '') + '</td></tr>';
				content += '<tr><td>Last update on</td><td>' + (moment(entry.updatedTime, "X").format('YYYY-MM-DD, HH:mm') || '') + '</td></tr>';
				content += '</table>';
				// Display popover
				$('.popover').remove();
				$(row).popover({
					content: content,
					container: "body",
					trigger: "manual",
					html: true,
					placement: function(arg1, sourceDiv){
						if($(sourceDiv).offset().left + $(sourceDiv).width() / 2 - $(window).width() / 2 > 0){
							return 'left';
						}
						return 'right';
					}
				});
				$(row).popover('show');
				$('.popover').click(function(event){event.stopPropagation();});
			}
		});
		$(element).find('tbody').click(function(event){ event.stopPropagation(); });
	});
};