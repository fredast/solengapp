var Report = function(urlData, typeName){
	this.urlData = urlData;
	this.data = [];
	this.typeName = typeName;
	
	var thisR = this;
	$(document).ready(function(){
		// Load data
		thisR.load();
	});
};

/*
	---------------
	LOAD & SAVE
	---------------
*/

Report.prototype.load = function(){
	var thisR = this;
	$.ajax({
		type: "POST",
		url: thisR.urlData,
		data: {type: 'report', request: 'load', dataType: thisR.typeName},
		dataType: 'json',
		success: function(result){
			thisR.data = result.data;
			thisR.type = result.dataType;
			thisR.userOptions = result.userOptions;
			thisR.initialize();
		},
		error: function(error, text){
			console.log(error);
			console.log(error.responseText);
		}
	});
};

Report.prototype.initialize = function(){
	var thisR = this;
	// Titles
	$('#report-title').html(thisR.type.name);
	document.title = thisR.type.name;
	$('.data-report-name').html(thisR.type.name.toLowerCase());
	
	// Columns
	thisR.type.columns.forEach(function(col){
		if(col.dataType == 'time'){
			col.renderer = function(instance, TD, row, col, prop, value, cellProperties){
				var dateTime = moment(value, "X");
				if(dateTime.isValid()){
					$(TD).html(dateTime.format('YYYY-MM-DD'));
				}
			}
		}
	});
	
	// Handsontable
	thisR.currentData = thisR.data.filter(function(entry){return !entry.deleted; });
	$('#handsontable-container').handsontable({
		data: thisR.currentData,
		minSpareRows: 1,
		colHeaders: thisR.type.columnsHeader,
		columnSorting: true,
		stretchH: 'all',
		columns: thisR.type.columns,
		contextMenu: ['row_above', 'row_below', 'remove_row'],
		afterChange: function(change, source){
			if(Object.prototype.toString.call(change) == "[object Array]"){
				change.forEach(function(entry){
					if(entry[2] != entry[3]){
						thisR.currentData[entry[0]].modified = true;
					}
				});
			}
		},
		beforeRemoveRow: function(index, amount){
			for(i=index;i<index+amount;i++){
				thisR.currentData[i].deleted = true;
			}
		},
		afterCreateRow: function(index, amount){
			for(i=index;i<index+amount;i++){
				thisR.data.push(thisR.currentData[i]);
			}
		},
		afterSelection: function(r, c, r2, c2){
			// Focus on cell
			var element = thisR.handsontableHandler.getCell(r2, c2);
			var offset = $(element).offset().left + $(element).outerWidth() - $(window).scrollLeft() - window.innerWidth;
			if(offset > 0){
				$(window).scrollLeft(offset + $(window).scrollLeft());
			}
		}
	});
	thisR.handsontableHandler = $('#handsontable-container').handsontable('getInstance');
	
	// Commands
	// __Discard changes
	$('#cmd-confirm-discard').click(function(){
		location.reload();
	});
	// __Show changes before saving
	$('#cmd-save').click(function(){
		var beforeSave = thisR.beforeSave();
		$('#data-nb-add').html(beforeSave.createdData.length);
		$('#data-nb-update').html(beforeSave.modifiedData.length);
		$('#data-nb-delete').html(beforeSave.deletedData.length);
		$('#modal-save').modal('show');
	});
	// __Save
	$('#cmd-confirm-save').click(function(){thisR.save();});
	// Search button
	$('#cmd-search-box').keyup(function(event){
		if(event.keyCode == 13) {
			event.preventDefault();
			return false;
		}
		thisR.search();
	});
};
	
Report.prototype.save = function(){
	var thisR = this;
	var modifiedData = thisR.data.filter(function(entry){return entry.modified;});
	if(modifiedData.length == 0){ return true; }
	$('#cmd-confirm-save').button('loading');
	console.log(modifiedData);
	$.ajax({
		type: "POST",
		url: thisR.urlData,
		data: {type: 'report', request: 'save', dataType: thisR.type.code, data: modifiedData},
		success: function(result){
			$('#cmd-confirm-save').button('reset');
			location.reload();
		},
		error: function(error, text){
			console.log(error);
			console.log(error.responseText);
		}
	});
};

Report.prototype.beforeSave = function(){
	var thisR = this;
	var result = {createdData: [], modifiedData: [], deletedData: []};
	thisR.data.forEach(function(entry){
		var empty = thisR.isEntryEmpty(entry);
		var exist = typeof entry.dbId != "undefined" && entry.dbId != null && entry.dbId != "";
		if(!exist && !empty){
			result.createdData.push(entry);
		}
		else if(exist && !empty && entry.modified && !entry.deleted){
			result.modifiedData.push(entry);
		}
		else if(exist && (empty || entry.deleted) && exist.modified){
			result.deletedData.push(entry);
			entry.deleted = true;
		}
		else if(!exist && empty){
			entry.modified = false;
		}
	});
	return result;
};
		
Report.prototype.isEntryEmpty = function(entry){
	var thisR = this;
	var answer = true;
	thisR.type.columns.forEach(function(col){
		var value = entry[col.data];
		if(value != undefined && value != "" && value != null && !col.readOnly){
			answer = false;
		}
	});
	return answer;
};

/*
	---------------
	SEARCH
	---------------
*/

Report.prototype.search = function(){
	var thisR = this;
	var keyword = $('#cmd-search-box').val();
	// Clean data
	thisR.cleanData();
	// Filter data
	if(typeof keyword == undefined || keyword == ''){
		thisR.currentData = thisR.data.filter(function(entry){ return !entry.deleted; });
	}
	else{
		var keywords = keyword.split(' ');
		thisR.currentData = thisR.data.filter(function(entry){
			if(entry.deleted){ return false; }
			return keywords.every(function(kwd){
				var regKwd = new RegExp(kwd, "i");
				return thisR.type.columns.some(function(col){
					return (typeof entry[col.data] == "string" ? entry[col.data].search(regKwd) >= 0 : false);
				});
			});
		});
	}
	thisR.handsontableHandler.loadData(thisR.currentData);
};

Report.prototype.cleanData = function(){
	var thisR = this;
	thisR.data.forEach(function(entry){
		var empty = thisR.isEntryEmpty(entry);
		var exist = typeof entry.dbId != "undefined" && entry.dbId != null && entry.dbId != "";
		if(!exist && empty){
			var index = thisR.data.indexOf(entry);
			thisR.data.splice(index, 1);
		}
	});
};