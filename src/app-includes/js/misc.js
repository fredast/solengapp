FOCUS_OF_TARGET = { 'panel panel-default': '.panel-title', 'panel-heading':'.panel-title', 'panel-body':'.panel-text', 'panel-footer':'panel-tags'};

var misc = function(idCmdAdd, idPanelContainer, idUpdateInfo, urlData){
	this.data = [];
	this.active = [];
	this.currentTempId = 0;
	this.idCmdAdd = idCmdAdd;
	this.idPanelContainer = idPanelContainer;
	this.idUpdateInfo = idUpdateInfo;
	this.urlData = urlData;
	this.updateStatus = {};
	
	var thisMisc = this;
	$(document).ready(function () {
		$(thisMisc.idCmdAdd).click(function(){
			thisMisc.addEntry();
		});
		thisMisc.loadData();
		thisMisc.displayUpdateInfo({saved: true, processing: false});
		thisMisc.autosave = setInterval(function(){thisMisc.saveData();}, 30000);
	});
};

misc.prototype.addEntry = function(){
	var thisMisc = this;
	
	// Create entry
	var newEntry = {};
	newEntry.status = 'tempId';
	newEntry.tempId = thisMisc.currentTempId;
	thisMisc.currentTempId++;
	newEntry.title = '';
	newEntry.text = '';
	newEntry.tags = [];
	newEntry.modified = true;
	thisMisc.data.push(newEntry);
	thisMisc.displayUpdateInfo({saved: false});
	
	// Add panel
	thisMisc.addPanel(newEntry);
};

misc.prototype.addPanel = function(entry){
	var thisMisc = this;
	var newPanel = thisMisc.newPanel(entry, true);
	$(thisMisc.idPanelContainer)[0].insertBefore(newPanel.panel,$(thisMisc.idPanelContainer)[0].firstChild);
	newPanel.functionAfter();
	$($(thisMisc.idPanelContainer).find('.panel-title')[0]).focus();
	thisMisc.configureEvents();
};
		
misc.prototype.newPanel = function(entry, active){
	var panelTitle, panelText, panelTags, panelTag, panelHeading, panelBody, panelFooter, panel, functionAfter;
	functionAfter = function(){ return true; };
	// Title
	if(active){
		panelTitle = document.createElement("input");
		panelTitle.className = 'form-control panel-title  misc-input';
		panelTitle.setAttribute('field', 'title');
		panelTitle.setAttribute('placeholder', 'Title');
		panelTitle.setAttribute('spellcheck', 'false');
		panelTitle.value = entry.title;
	}
	else{
		panelTitle = document.createElement("span");
		panelTitle.className = 'lead';
		panelTitle.innerHTML = entry.title;
	}
	// Text
	if(active){
		panelText = document.createElement('textarea');
		panelText.className = 'form-control panel-text misc-input'; 
		panelText.setAttribute('field', 'text');
		panelText.setAttribute('placeholder', 'Details...');
		panelText.setAttribute('rows', '1');
		panelText.setAttribute('spellcheck', 'false');
		panelText.value = entry.text;
		panelText.id = 'toto';
		$(panelText).autosize({append:''});
	}
	else{
		panelText = document.createElement('span');
		panelText.innerHTML = entry.text.replace(/\n/g,'</br>');
	}
	//Tags
	if(active){
		panelTags = document.createElement('select');
		panelTags.setAttribute('field', 'tags');
		panelTags.className = 'panel-tags';
		panelTags.multiple = true;
		lastId = 'tag' + Math.floor(Math.random() * 10000).toString();
		panelTags.id = lastId;
		lastTagList = entry.tags;
		functionAfter = function(){
			$('#' + lastId).tagsinput({
				trimValue: true,
				confirmKeys: [13, 188, 190, 32, 186],
				tagClass: 'label label-default',
				typeahead: {
					source: TAGS_TYPEAHEAD
				},
				freeInput: false
			});
			lastTagList.forEach(function(tag){
				$('#' + lastId).tagsinput('add', tag);
			});
			$($('#' + lastId).parent()).find('input').attr({'style':'width: 5em !important;'});
			if(lastTagList.length == 0){
				$($('#' + lastId).parent()).find('input').attr({'placeholder':'Add tags...'});
			}
			else{
				$($('#' + lastId).parent()).find('input').attr({'placeholder':''});
			}
			$('textarea').trigger('autosize.resize');
		};
			
	}
	else{
		panelTags = document.createElement("span");
		entry.tags.forEach(function(tag){
			panelTag = document.createElement('span');
			panelTag.className = 'label label-default';
			panelTag.innerHTML = tag;
			panelTags.appendChild(panelTag);
			panelTags.innerHTML += ' ';
		});
	}
	
	// Nesting
	panelHeading = document.createElement('div');
	panelHeading.className = 'panel-heading';
	panelHeading.innerHTML = '<button type="button" class="close"><span aria-hidden="true">&times;</span></button>';
	panelHeading.appendChild(panelTitle);
	panelBody = document.createElement('div');
	panelBody.className = 'panel-body';
	panelBody.appendChild(panelText);
	panelFooter = document.createElement('div');
	panelFooter.className = 'panel-footer';
	panelFooter.appendChild(panelTags);
	panel = document.createElement('div');
	panel.className = 'panel panel-default';
	panel.setAttribute('status', entry.status);
	panel.setAttribute(entry.status, entry[entry.status]);
	panel.setAttribute('active', active.toString());
	panel.appendChild(panelHeading);
	panel.appendChild(panelBody);
	panel.appendChild(panelFooter);
	
	result = {panel: panel, functionAfter: functionAfter};
	return result;
};

misc.prototype.configureEvents = function(){
	var thisMisc = this;
	$($(thisMisc.idPanelContainer).find('.form-control')).off('keyup');
	$($(thisMisc.idPanelContainer).find('.form-control')).keyup(function(){
		thisMisc.readInput(this);
	});
	$($(thisMisc.idPanelContainer).find('.panel-tags')).off();
	$($(thisMisc.idPanelContainer).find('.panel-tags')).on('itemAdded', function(event) {
		thisMisc.readInput(this);
	});
	$($(thisMisc.idPanelContainer).find('.panel-tags')).on('itemRemoved', function(event) {
		thisMisc.readInput(this);
	});
	$($(thisMisc.idPanelContainer).find('.close')).off('click');
	$($(thisMisc.idPanelContainer).find('.close')).click(function(){
		panel = this.parentElement.parentElement;
		changes = {status: panel.getAttribute('status'), field:'deleted', value:"true"};
		changes[changes.status] = panel.getAttribute(changes.status);
		thisMisc.updateEntry(changes);
		$(panel).remove();
	});
};

misc.prototype.readInput = function(input){
	var thisMisc = this;
	var field = $(input).attr('field');
	var status = $($(input).parents()[1]).attr('status');
	var id = $($(input).parents()[1]).attr(status);
	if(field == 'tags'){
		var value = $(input).tagsinput('items');
		if(value.length == 0){
			$($(input).parent()).find('input').attr({'placeholder':'Add tags...'});
		}
		else{
			$($(input).parent()).find('input').attr({'placeholder':''});
		}
	}
	else{
		var value = $(input).val();
	}
	var changes = {status: status, field: field, value: value};
	//if(field == 'tags' && value == null){ value = []; }
	changes[status] = id;
	thisMisc.updateEntry(changes);
};

misc.prototype.updateEntry = function(changes){
	var thisMisc = this;
	var index = thisMisc.indexEntry(changes, thisMisc.data);
	if(index == -1){
		console.log("Index doesn't exist");
		return false;
	}
	thisMisc.data[index][changes.field] = changes.value;
	thisMisc.data[index].modified = true;
	
	thisMisc.displayUpdateInfo({saved: false});
};
	
misc.prototype.indexEntry = function(entry, array){
	var index = -1;
	array.some(function(item, id){
		if( item[entry.status] == entry[entry.status] ){
			index = id;
			return true;
		}
	});
	return index;
};

misc.prototype.saveData = function(){
	var thisMisc = this;
	var modifiedData = [];
	thisMisc.data.forEach(function(entry){
		if(entry.modified && (entry.deleted != "true" || entry.status == "id")){
			modifiedData.push(entry);
			delete entry.modified;
		}
	});
	if(modifiedData.length == 0){
		thisMisc.displayUpdateInfo({saved: true});
		return true;
	}
	thisMisc.displayUpdateInfo({saved: true, processing: true});
	$.ajax({
		type: "POST",
		url: thisMisc.urlData,
		data: {type: 'misc', request: 'save', data: modifiedData},
		dataType: 'json',
		success: function(result){
			if(result.success = 'true'){
				thisMisc.displayUpdateInfo({processing: false});
				if(typeof result.newId !== 'undefined'){
					result.newId.forEach(function(newId){
						changes = {status: 'tempId', tempId: newId.tempId}
						var index = thisMisc.indexEntry(changes, thisMisc.data);
						if(index == -1){
							console.log("Index doesn't exist");
						}
						else{
							thisMisc.data[index].id = newId.id;
							thisMisc.data[index].status = 'id';
						}
					});
				}
			}
			else{
				thisMisc.displayUpdateInfo({saved: false, processing: 'failed'});
				modifiedData.forEach(function(entry){
					entry.modified = true;
				});
				alert(msg);
			}
		},
		error: function(error, msg){
			thisMisc.displayUpdateInfo({saved: false, processing: 'failed'});
			modifiedData.forEach(function(entry){
				entry.modified = true;
			});
			alert(msg);
		}
	});
};

misc.prototype.loadData = function(){
	var thisMisc = this;
	$.ajax({
		type: "POST",
		url: thisMisc.urlData,
		data: {type: 'misc', request: 'load'},
		dataType: 'json',
		success: function(result){
			thisMisc.data = result.data;
			thisMisc.param = result.param;
			// Display the list of tags
			thisMisc.param.tagsTypeahead.forEach(function(tag){ $('#modalTagsList .modal-body p').append($('<span class="label label-default"></span>').text(tag)).append(' '); });
			TAGS_TYPEAHEAD = thisMisc.param.tagsTypeahead;
			// Clean and display the data
			thisMisc.cleanData();
			thisMisc.displayData();
		}
	});
};

misc.prototype.cleanData = function(){
	var thisMisc = this;
	thisMisc.data.forEach(function(entry){
		entry['title'] = typeof entry['title'] !== 'undefined' ? entry['title'] : '';
		entry['text'] = typeof entry['text'] !== 'undefined' ? entry['text'] : '';
		entry['tags'] = typeof entry['tags'] !== 'undefined' ? entry['tags'] : [];
	});
};

misc.prototype.displayData = function(){
	var thisMisc = this;
	thisMisc.deleteAllPanel();
	thisMisc.data.forEach(function(entry){
		if(entry.deleted != "true"){
			thisMisc.addPanel(entry);
		}
	});
};

misc.prototype.deleteAllPanel = function(){
	var thisMisc = this;
	$($(thisMisc.idPanelContainer).find('.panel')).remove();
};

misc.prototype.displayUpdateInfo = function(status){
	var thisMisc = this;
	if((typeof status.saved !== 'undefined' && thisMisc.updateStatus.saved != status.saved) || (typeof status.processing !== 'undefined' && thisMisc.updateStatus.processing != status.processing)){
		thisMisc.updateStatus.saved = typeof status.saved !== 'undefined' ? status.saved : thisMisc.updateStatus.saved;
		thisMisc.updateStatus.processing = typeof status.processing !== 'undefined' ? status.processing : thisMisc.updateStatus.processing;
		if(thisMisc.updateStatus.processing == 'failed'){
			$(thisMisc.idUpdateInfo)[0].className = 'btn btn-danger btn-xs';
			$(thisMisc.idUpdateInfo)[0].innerHTML = 'Autosave failed (click to retry)';
			clearInterval(thisMisc.autosave);
			$(thisMisc.idUpdateInfo).click(function(){
				thisMisc.autosave = setInterval(function(){thisMisc.saveData();}, 30000);
				thisMisc.saveData();
				
			});
		}
		else if(thisMisc.updateStatus.processing){
			$(thisMisc.idUpdateInfo)[0].className = 'btn btn-warning btn-xs disabled';
			$(thisMisc.idUpdateInfo)[0].innerHTML = 'Autosave...';
		}
		else if(thisMisc.updateStatus.saved){
			$(thisMisc.idUpdateInfo)[0].className = 'btn btn-info btn-xs disabled';
			$(thisMisc.idUpdateInfo)[0].innerHTML = 'Autosave succeed';
		}
		else{
			$(thisMisc.idUpdateInfo)[0].className = 'btn btn-warning btn-xs';
			$(thisMisc.idUpdateInfo)[0].innerHTML = 'Unsaved changes (click to save)';
			$(thisMisc.idUpdateInfo).click(function(){
				thisMisc.saveData();
			});
		}
	}
};