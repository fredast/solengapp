
// Array comparison (value per value)
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
};

var dashboardAdmin = function(urlData){
	this.urlData = urlData;
	this.data = [];
	this.draggable = false;
	this.draggableList = [];
	widgetry.thisDA = this;
	
	var thisDA = this;
	$(document).ready(function () {
		// Initialize
		thisDA.load();
	});
};

/*
	---------------
	LOAD & SAVE
	---------------
*/

dashboardAdmin.prototype.load = function(){
	var thisDA = this;
	$.ajax({
		type: "POST",
		url: thisDA.urlData,
		data: {type: 'dashboard', request: 'load'},
		dataType: 'json',
		success: function(result){
			thisDA.data = result.data;
			thisDA.argList = result.argList;
			thisDA.miscParam = result.miscParam;
			thisDA.reportTypeList = result.reportTypeList;
			thisDA.initialize();
		},
		error: function(error, text){
			console.log(error);
			console.log(error.responseText);
		}
	});
};

dashboardAdmin.prototype.save = function(){
	var thisDA = this;
	var modifiedData = thisDA.data.filter(function(dash){ return dash.modified; });
	if(modifiedData.length == 0){ return true; }
	$('#dash-cmd-save').button('loading');
	$.ajax({
		type: "POST",
		url: thisDA.urlData,
		data: {type: 'dashboard', request: 'save', data: modifiedData},
		success: function(result){
			console.log(result);
			$('#dash-cmd-save').button('reset');
			// Save the current dash id
			sessionStorage.setItem('currentDash', (typeof thisDA.current == 'object' ? thisDA.current.id : undefined));
			location.reload();
		}
	});
	return true;
};

dashboardAdmin.prototype.initialize = function(){
	var thisDA = this;
	// Dashboard list
	thisDA.updateDashList();
	
	// Check if current dash was saved
	currentId = sessionStorage.getItem('currentDash');
	sessionStorage.removeItem('currentDash');
	thisDA.current = thisDA.data.filter(function(dash){return dash.id == currentId; })[0];
	if(typeof thisDA.current == 'object'){
		$('#dash-cmd-select').val(thisDA.current.id);
		thisDA.showDash();
	}
		
	// Commands
	$('#dash-cmd-new').off().click(function(){
		thisDA.showModalSettings();
	});
	$('#dash-cmd-save').off().click(function(){
		thisDA.save();
	});
	$('#dash-cmd-settings').off().click(function(){
		thisDA.showModalSettings(thisDA.current);
	});
	$('#dash-cmd-add-wg').off().click(function(){
		if(typeof thisDA.current == 'object'){
			thisDA.showModalWidget();
		}
	});
	$('#dash-cmd-move-wg').off().click(function(){
		if(typeof thisDA.current == 'object'){
			if(thisDA.draguable){
				thisDA.draggableList.forEach(function(obj){obj.disable();});
				thisDA.draggableList = [];
				$('#dashContainer').packery();
				$('#dash-cmd-move-wg').attr('class', 'btn btn-default');
			}
			else{
				$('#dashContainer .widget').each( function( i, element ) {
					var draggie = new Draggabilly( element );
					thisDA.draggableList.push(draggie);
					$('#dashContainer').packery( 'bindDraggabillyEvents', draggie );
				});
				$('#dash-cmd-move-wg').attr('class', 'btn btn-warning');
			}
			thisDA.draguable = !thisDA.draguable;
		}
	});
			
	$('#dash-cmd-select').off().change(function(){
		thisDA.current = thisDA.data.filter(function(dash){return dash.id == $('#dash-cmd-select').val(); })[0];
		if(typeof thisDA.current == 'object'){
			thisDA.showDash();
		}
	});
};

dashboardAdmin.prototype.updateDashList = function(){
	var thisDA = this;
	$('#dash-cmd-select').empty();
	$('#dash-cmd-select').append('<option disabled selected value="">Edit a Dashboard</option>');
	thisDA.data.forEach(function(dash){
		if(!(dash.deleted)){
			$('#dash-cmd-select').append($('<option></option>').attr('value', dash.id).attr('selected', dash == thisDA.current).text(dash.name));
		}
	});
};

/*
	---------------
	SHOW DASH
	---------------
*/

dashboardAdmin.prototype.showDash = function(){
	var thisDA = this;
	
	// Hide dash
	if(typeof thisDA.current != 'object'){
		$('#dash-cmd-menu').hide();
		$('#dashContainer').empty();
		return true;
	}
	// Show dash
	$('#dash-cmd-menu').show();
	$('#dashContainer').empty().append('<div class="grid-sizer" id="grid-sizer"></div>').packery({
		itemSelector: '.widget',
		columnWidth: '.grid-sizer',
		gutter: 0,
		transitionDuration: '0s'
	});
	// Display widgets
	if(typeof thisDA.current.widgets == 'object'){
		thisDA.current.widgets.sort(function(obj1, obj2){ return obj1.order - obj2.order;});		
		thisDA.current.widgets.forEach(function(widget, index){ widgetry.showWidget(widget); });
	}
	$('#dashContainer').packery();
	
	// Save the order after move
	$('#dashContainer').packery( 'on', 'dragItemPositioned', function(){thisDA.getWidgetsOrder();});
};

/*
	---------------
	MANIPULATE DASH
	---------------
*/

dashboardAdmin.prototype.deleteDash = function(dash){
	var thisDA = this;
	dash.deleted = true;
	dash.modified = true;
	thisDA.current = undefined;
	thisDA.updateDashList();
	thisDA.showDash();
};

/*
	---------------
	SETTINGS
	---------------
*/

dashboardAdmin.prototype.showModalSettings = function(dash){
	var thisDA = this;
	var edit = typeof dash !== 'undefined';
	// Modal title
	$('#dash-modal-settings .modal-title').html(edit ? 'Settings' : 'New Dashboard');
	// Body
	var container = $('#dash-modal-settings-body')
	container.empty();
	$('#dash-modal-settings-after-body').empty();
	// Argument selection
	container.html('<h4>Argument</h4><select class="form-control" id="dash-in-argument"><option value="none">No argument (unique dashboard)</option></select>');
	thisDA.argList.forEach(function(arg){
		$('#dash-in-argument').append($('<option></option>').attr('value', arg.code).text(arg.name));
	});
	$('#dash-in-argument').prop("selectedIndex", -1);
	// Name selection
	container.append('<hr><h4>Name</h4><p id="dash-help-name" style="display:none"></p><input type="text" class="form-control" id="dash-in-name" placeholder="Name">');
	// Id selection
	container.append('<h4>Id</h4><input type="text" class="form-control" id="dash-in-id" placeholder="Id">');
	// Access
	container.append('<h4>Access</h4><p id="dash-help-access" style="display:none"></p><select multiple id="dash-in-access"></select>');
	$('#dash-in-access').tagsinput({
		trimValue: true,
		confirmKeys: [13, 188, 190, 32, 186],
		tagClass: 'label label-default',
		typeahead: {
			source: ['Equity', 'Retail']
		}
	});
	$('#dash-in-access').off().on('itemAdded itemRemoved', function(){
		var placeholder = $('#dash-in-access').tagsinput('items').length > 0 ? '' : 'Add groups...';
		$('#dash-in-access input').attr({'placeholder':placeholder});
	});
	// Dynamic
	$('#dash-in-argument').off().change(function(){
		if($('#dash-in-argument').val() == 'none'){
			$('#dash-help-name').hide();
			$('#dash-help-access').hide();
		}
		else{
			$('#dash-help-name').text('You must use [' + $('#dash-in-argument').val() + '] in the name, it will be replaced by the argument.').show();
			$('#dash-help-access').text('You can use [' + $('#dash-in-argument').val() + '] as a tag, it will be replaced by the argument.').show();
		}	
	});
	// Save
	$('#dash-help-cannot-save').hide();
	$('#dash-cmd-settings-save').off().click(function(){
		var canSave = canSaveSettings();
		if(canSave == true){
			//Either add a new dashboard or save the current
			$('#dash-help-cannot-save').hide();
			if(!edit){
				// Create dash
				var newDash = {widgets:[], widgetNewId: 0};
				thisDA.data.push(newDash);
				thisDA.current = newDash;
				thisDA.showDash();
			}
			thisDA.editSettings();
			thisDA.updateDashList();
			$('#dash-modal-settings').modal('hide');
		}
		else{
			$('#dash-help-cannot-save-text').html(canSave);
			$('#dash-help-cannot-save').show();
		}
	});
	
	// Edit entry
	if(edit){
		$('#dash-in-argument').val(dash.arg).trigger('change');
		$('#dash-in-name').val(dash.name).trigger('change');
		$('#dash-in-id').val(dash.id).trigger('change');
		dash.access.forEach(function(tag){
			$('#dash-in-access').tagsinput('add', tag);
		});
		// Delete possibility
		$('#dash-modal-settings-after-body').append('<hr><h4>Delete</h4><button type="button" class="btn btn-danger" id="dash-cmd-delete">Delete Dashboard</button>');
		$('#dash-cmd-delete').off().click(function(){
			thisDA.deleteDash(dash);
			$('#dash-modal-settings').modal('hide');
		});
	}
	
	// Show modal
	$('#dash-modal-settings').modal('show');
};

function canSaveSettings(){
	if(!($('#dash-in-argument').val())){ return 'You must specify an argument.'; }
	if(!($('#dash-in-name').val().length > 0)){ return 'You must specify a name.'; }
	if(!($('#dash-in-id').val().length > 0)){ return 'You must specify an id.'; }
	// Check also if the id already exist
	if(!($('#dash-in-access').tagsinput('items').length > 0)){ return 'You must specify at least a group for access.'; }
	return true;
}

dashboardAdmin.prototype.editSettings = function(){
	var thisDA = this;
	if( thisDA.current.arg != $('#dash-in-argument').val() ){
		thisDA.current.arg = $('#dash-in-argument').val();
		thisDA.current.modified = true;
	}
	if( thisDA.current.name != $('#dash-in-name').val() ){
		thisDA.current.name = $('#dash-in-name').val();
		thisDA.current.modified = true;
	}
	if( thisDA.current.id != $('#dash-in-id').val() ){
		thisDA.current.id = $('#dash-in-id').val();
		thisDA.current.modified = true;
	}
	if( typeof thisDA.current.access !== 'object' || !(thisDA.current.access.equals($('#dash-in-access').tagsinput('items'))) ){
		thisDA.current.access = $('#dash-in-access').tagsinput('items').slice();
		thisDA.current.modified = true;
	}
};

/*
	---------------
	MANIPULATE WIDGETS
	---------------
*/

dashboardAdmin.prototype.showModalWidget = function(widget){
	var thisDA = this;
	var edit = typeof widget !== 'undefined';
	// Modal title
	$('#dash-modal-settings .modal-title').html(edit ? 'Settings' : 'New Widget');
	// Body
	var container = $('#dash-modal-settings-body')
	container.empty();
	$('#dash-modal-settings-after-body').empty();
	// Help argument
	if(thisDA.current.arg != 'none'){
		container.append('<p>You can use [' + thisDA.current.arg + '] in the widgets configuration, it will be replaced by the argument</p>');
	}
	// Type selection
	container.append('<h4>Type</h4><select class="form-control" id="dash-wg-in-type"></select>');
	widgetry.list.forEach(function(type){
		container.find('select').append($('<option></option>').attr('value',type.id).text(type.name));
	});
	$('#dash-wg-in-type').prop("selectedIndex", -1);
	// Dynamic
	$('#dash-wg-in-type').off().change(function(){
		$('#dash-wg-in-type').nextAll().remove();
		widgetry.displaySettings(widget);
	});
	// Save
	$('#dash-help-cannot-save').hide();
	$('#dash-cmd-settings-save').off().click(function(){
		var canSave = canSaveWidget();
		if(canSave == true){
			$('#dash-help-cannot-save').hide();
			//Either add a new widget or save the current
			if(!edit){
				thisDA.current.widgets = typeof thisDA.current.widgets !== 'undefined' ? thisDA.current.widgets : [];
				widget = {id: thisDA.current.widgetNewId, order: thisDA.current.widgets.length};
				thisDA.current.widgetNewId++;
				thisDA.current.widgets.push(widget);
			}
			widgetry.editWidget(widget);
			$('#dashContainer').packery();
			thisDA.current.modified = true;
			$('#dash-modal-settings').modal('hide');
		}
		else{
			$('#dash-help-cannot-save-text').html(canSave);
			$('#dash-help-cannot-save').show();
		}
	});
	// Edit changes
	if(edit){
		$('#dash-wg-in-type').val(widget.type).trigger('change');
		// Delete possibility
		$('#dash-modal-settings-after-body').append('<hr><h4>Delete</h4><button type="button" class="btn btn-danger" id="dash-cmd-delete">Delete Widget</button>');
		$('#dash-cmd-delete').off().click(function(){
			// Delete widget from display
			var element = $('#dashContainer .widget').filter(function(index, elmt){ return $(elmt).attr('widgetid') == widget.id; })[0];
			$('#dashContainer').packery( 'remove', element ).packery();
			thisDA.getWidgetsOrder();
			// Delete widget from the data
			var index = thisDA.current.widgets.indexOf(widget);
			thisDA.current.widgets.splice(index, 1);
			thisDA.current.modified = true;
			$('#dash-modal-settings').modal('hide');
		});
	}
	
	// Show modal
	$('#dash-modal-settings').modal('show');
};

function canSaveWidget(){
	if(!($('#dash-wg-in-type').val())){ return 'You must specify a type.'; }
	return widgetry.canSaveWidget();
}

dashboardAdmin.prototype.getWidgetsOrder = function(){
	var thisDA = this;
	thisDA.current.modified = true;
	$('#dashContainer').packery('getItemElements').forEach(function(element, i){
		widget = thisDA.current.widgets.filter(function(wg){ return wg.id == $(element).attr('widgetid'); })[0];
		if(typeof widget == 'object'){ widget.order = i; }
	});
};