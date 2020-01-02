this["Fliplet"] = this["Fliplet"] || {};
this["Fliplet"]["Widget"] = this["Fliplet"]["Widget"] || {};
this["Fliplet"]["Widget"]["Templates"] = this["Fliplet"]["Widget"]["Templates"] || {};

this["Fliplet"]["Widget"]["Templates"]["templates.interface.add-markers"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"add-markers-component clearfix\">\n  <div v-show=\"savedData\" class=\"col-xs-8 maps-wrapper\">\n    <div v-if=\"isLoading\" class=\"maps-loading-holder\">\n      <div class=\"spinner-holder animated\">\n        <div class=\"spinner-overlay\">Loading...</div>\n        <p>Loading... Please wait!</p>\n      </div>\n    </div>\n    <div v-else class=\"maps-container\" v-bind:class=\"{ 'empty-state': !mappedMarkerData.length }\">\n      <div class=\"map-wrapper-holder\">\n        <div v-for=\"(map, index) in widgetData.maps\" class=\"map-wrapper\" v-bind:class=\"{ 'active': selectedMarkerData.map && map.id === selectedMarkerData.map.id && imageLoaded }\">\n          <div class=\"map-container\" :id=\"'map-' + map.id\">\n            <img v-show=\"map.image\" class=\"map-image\" :src=\"map.image.url\" :width=\"map.image.size ? map.image.size[0] : ''\" :height=\"map.image.size ? map.image.size[1] : ''\"/>\n          </div>\n        </div>\n      </div>\n      <div v-if=\"selectedMarkerData.map && selectedMarkerData.map.name\" class=\"maps-button\">\n        <i class=\"fa fa-map-o\"></i>\n        <div class=\"map-button-text\"><p>{{selectedMarkerData.map.name}}</p></div>\n      </div>\n      <div v-if=\"selectedMarkerData.map && selectedMarkerData.map.name\" class=\"map-hint-holder\">\n        <div class=\"map-hint\">Click the image to set the marker position</div>\n      </div>\n    </div>\n  </div>\n  <div class=\"settings-holder\" v-bind:class=\"{ 'col-xs-12 less-bottom-padding': !savedData, 'col-xs-4 with-border': savedData }\">\n    <div class=\"marker-settings-wrapper\">\n      <div class=\"form-group clearfix\">\n        <div class=\"col-xs-12 control-label\">\n          <label>Markers data source</label>\n        </div>\n        <div class=\"col-xs-12\">\n          <template v-if=\"!savedData\">\n            <multiselect v-model=\"markersDataSource\" :options=\"dataSources\" :custom-label=\"nameWithId\" placeholder=\"-- Select a data source\" label=\"name\" :show-labels=\"false\" :allow-empty=\"false\" :show-no-results=\"false\"></multiselect>\n            <a v-if=\"markersDataSource\" href=\"#\" @click.prevent=\"editDataSource\">Edit data</a>\n          </template>\n          <template v-else>\n            You are using the data source called <strong>{{markersDataSource.name}}</strong>.<br>\n            <span>\n              <a href=\"#\" @click.prevent=\"editDataSource\">Bulk upload data</a> | \n              <a href=\"#\" @click.prevent=\"configureDataSources\">Switch to another data source</a>\n            </span>\n          </template>\n        </div>\n      </div>\n      <template v-if=\"!savedData\">\n        <div class=\"form-group clearfix\">\n          <div class=\"col-xs-12 control-label\">\n            <label>Marker name field</label>\n          </div>\n          <div class=\"col-xs-12\">\n            <multiselect v-model=\"markerNameColumn\" :options=\"markersDataSource.columns\" placeholder=\"-- Select a field\" :show-labels=\"false\" :allow-empty=\"false\" :show-no-results=\"false\"></multiselect>\n          </div>\n        </div>\n        <div class=\"form-group clearfix\">\n          <div class=\"col-xs-12 control-label\">\n            <label>Map name field</label>\n          </div>\n          <div class=\"col-xs-12\">\n            <multiselect v-model=\"markerMapColumn\" :options=\"markersDataSource.columns\" placeholder=\"-- Select a field\" :show-labels=\"false\" :allow-empty=\"false\" :show-no-results=\"false\"></multiselect>\n          </div>\n        </div>\n        <div class=\"form-group clearfix\">\n          <div class=\"col-xs-12 control-label\">\n            <label>Marker type field</label>\n          </div>\n          <div class=\"col-xs-12\">\n            <multiselect v-model=\"markerTypeColumn\" :options=\"markersDataSource.columns\" placeholder=\"-- Select a field\" :show-labels=\"false\" :allow-empty=\"false\" :show-no-results=\"false\"></multiselect>\n          </div>\n        </div>\n        <div class=\"form-group clearfix\">\n          <div class=\"col-xs-12 control-label\">\n            <label>Marker X position field</label>\n          </div>\n          <div class=\"col-xs-12\">\n            <multiselect v-model=\"markerXPositionColumn\" :options=\"markersDataSource.columns\" placeholder=\"-- Select a field\" :show-labels=\"false\" :allow-empty=\"false\" :show-no-results=\"false\"></multiselect>\n          </div>\n        </div>\n        <div class=\"form-group clearfix\">\n          <div class=\"col-xs-12 control-label\">\n            <label>Marker Y position field</label>\n          </div>\n          <div class=\"col-xs-12\">\n            <multiselect v-model=\"markerYPositionColumn\" :options=\"markersDataSource.columns\" placeholder=\"-- Select a field\" :show-labels=\"false\" :allow-empty=\"false\" :show-no-results=\"false\"></multiselect>\n          </div>\n        </div>\n        <div class=\"form-group clearfix\">\n          <div class=\"col-xs-12\">\n            <div class=\"btn btn-default\" @click.prevent=\"useSettings\">Use these settings</div>\n            <p v-if=\"dsConfigError\" class=\"text-danger\">You need to fill in all the above fields.</p>\n          </div>\n        </div>\n      </template>\n      <template v-else>\n        <div class=\"form-group clearfix markers-ui-holder\">\n          <div class=\"col-xs-12 control-label\">\n            <label>Configure the markers</label>\n          </div>\n          <div v-if=\"isLoading\" class=\"col-xs-12 markers-ui-loading\">\n            <div class=\"spinner-holder animated\">\n              <div class=\"spinner-overlay\">Loading...</div>\n              <p>Loading... Please wait!</p>\n            </div>\n          </div>\n          <div v-else class=\"col-xs-12 markers-ui\" v-bind:class=\"{ 'empty-state': !mappedMarkerData.length }\">\n            <div v-if=\"!mappedMarkerData.length\" class=\"no-markers\">\n              Use the button below to add a new marker to your map.\n            </div>\n            <div v-else v-for=\"(markerInfo, index) in mappedMarkerData\" class=\"marker-holder\" v-bind:class=\"{ 'active': activeMarker === index }\" @click.prevent=\"setActiveMarker(index)\">\n              <div class=\"marker-wrapper\">\n                <div v-if=\"markerInfo.data.updateName\" class=\"marker-name-edit-holder\">\n                  <input v-bind:class=\"{ 'marker-error' : !markerInfo.data.name.trim() }\" v-model=\"markerInfo.data.name\" :ref=\"'changename-' + index\" class=\"form-control\" @keyup.enter=\"confirmName(index)\" @keyup.esc=\"cancelNameUpdate(index)\"/> <i class=\"fa fa-check-circle\" @click.prevent=\"confirmName(index)\"></i> <i class=\"fa fa-ban\" @click.prevent=\"cancelNameUpdate(index)\"></i>\n                </div>\n                <div v-else class=\"marker-name-holder\">\n                  <span>{{markerInfo.data.name}}</span> <i class=\"fa fa-pencil\" @click.prevent=\"toUpdateName(index, markerInfo.data.name)\"></i>\n                </div>\n                <div class=\"marker-map-holder\">\n                  <div class=\"btn-group\">\n                    <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\n                      <template v-if=\"markerInfo.data && markerInfo.data.map\">\n                        <span class=\"map-name\">{{markerInfo.data.map}}</span>\n                      </template>\n                      <template v-else>\n                        &nbsp;\n                      </template>\n                      <span class=\"caret\"></span>\n                    </button>\n                    <ul class=\"dropdown-menu dropdown-menu-right\">\n                      <li v-for=\"map in widgetData.maps\"><a href=\"#\" @click.prevent=\"updateMap(map.name, index)\">{{map.name}}</a></li>\n                    </ul>\n                  </div>\n                </div>\n                <div class=\"marker-icon-holder\">\n                  <div class=\"btn-group\">\n                    <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\n                      <template v-if=\"markerInfo.data && markerInfo.data.icon && markerInfo.data.color\">\n                        <i :class=\"markerInfo.data.icon + ' fa-fw'\" :style=\"'color: ' + markerInfo.data.color\"></i>\n                      </template>\n                      <template v-else>\n                        &nbsp;\n                      </template>\n                      <span class=\"caret\"></span>\n                    </button>\n                    <ul class=\"dropdown-menu dropdown-menu-right\">\n                      <li v-for=\"marker in widgetData.markers\">\n                        <a href=\"#\" @click.prevent=\"updateMarker(marker, index)\">{{marker.name}} <i :class=\"marker.icon + ' fa-fw'\" :style=\"'color: ' + marker.color\"></i></a>\n                      </li>\n                      <li class=\"divider\"></li>\n                      <li>\n                        <a href=\"#\" @click.prevent=\"toggleEditMarkerOverlay\"><span class=\"text-primary\">Manage styles</span></a>\n                      </li>\n                    </ul>\n                  </div>\n                </div>\n              </div>\n              <div class=\"marker-delete-holder\" @click.stop=\"deleteMarker(index)\">\n                <i class=\"fa fa-trash\"></i>\n              </div>\n            </div>\n          </div>\n        </div>\n      </template>\n    </div>\n    <div class=\"settings-buttons-wrapper\" v-if=\"savedData\">\n      <div class=\"btn btn-secondary\" @click.prevent=\"addNewMarker\">Add new marker</div>\n    </div>\n  </div>\n  <transition name=\"fade\">\n    <div v-if=\"showEditMarkerOverlay\" class=\"edit-marker-overlay\">\n      <div class=\"edit-marker-overlay-content\">\n        <div class=\"marker-overlay-content-header\">\n          <h3 class=\"marker-overlay-title\">Marker styles</h3>\n          <div class=\"marker-overlay-close\" @click.prevent=\"toggleEditMarkerOverlay\">\n            <a href=\"#\"><i class=\"fa fa-times-thin fa-2x\"></i></a>\n          </div>\n        </div>\n        <div class=\"marker-overlay-content-body\">\n\n          <div class=\"map-markers-holder\">\n            <div class=\"add-map-marker\" @click.prevent=\"onAddMarker\"><i class=\"fa fa-plus-circle\"></i> Add a new marker style</div>\n            <div class=\"panel-group\" id=\"markers-accordion\">\n\n              <div v-for=\"(marker, idx) in allMarkerStyles\" v-bind:key=\"marker.id\" v-bind:class=\"[marker.error ? 'panel-danger' : 'panel-default']\" class=\"panel marker-panel\" :data-id=\"marker.id\">\n                <div class=\"panel-heading\">\n                  <h4 class=\"panel-title\" v-bind:class=\"{ 'collapsed': !marker.isFromNew }\" data-toggle=\"collapse\" data-parent=\"#markers-accordion\" :data-target=\"'#collapse-' + marker.id\">\n                    <span class=\"panel-title-text\">{{marker.name}}</span>\n                    <span class=\"fa panel-chevron fa-chevron-up\"></span>\n                  </h4>\n                  <a href=\"#\" @click.prevent=\"deleteMarkerStyle(idx)\"><span class=\"icon-delete fa fa-trash\"></span></a>\n                </div>\n                <div :id=\"'collapse-' + marker.id\" class=\"panel-collapse collapse\" v-bind:class=\"{ in: marker.isFromNew }\">\n                  <div class=\"panel-body\">\n\n                    <component :is=\"marker.type\" v-bind=\"marker\"></component>\n\n                  </div>\n                </div>\n              </div>\n\n            </div>\n          </div>\n\n        </div>\n      </div>\n    </div>\n  </transition>\n</div>";
},"useData":true});

this["Fliplet"]["Widget"]["Templates"]["templates.interface.map-panel"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div>\n  <div class=\"form-group clearfix\">\n    <div class=\"col-xs-12 control-label\">\n      <label>Map name</label>\n    </div>\n    <div class=\"col-xs-12\">\n      <input type=\"text\" class=\"form-control\" @input=\"updateDebounced\" v-model.trim=\"name\" @keyup=\"onInputData\" @focus=\"getMapName\"/>\n      <div class=\"error-holder\" v-if=\"error\">{{error}}</div>\n    </div>\n  </div>\n\n  <div class=\"form-group clearfix\">\n    <div class=\"col-xs-12 control-label\">\n      <label>Map image</label>\n    </div>\n    <div class=\"col-xs-12\">\n      <div v-if=\"!image\" class=\"btn btn-default\" @click.prevent=\"openMapPicker\">\n        <span>Select an image</span>\n      </div>\n      <div v-else class=\"selected-image-container\">\n        <div class=\"selected-image-holder\" :style=\"'background-image: url(' + image.url + ')'\"></div>\n        <div class=\"btn btn-link\" @click.prevent=\"openMapPicker\">Replace image</div>\n      </div>\n    </div>\n  </div>\n</div>\n";
},"useData":true});

this["Fliplet"]["Widget"]["Templates"]["templates.interface.marker-panel"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div>\n  <div class=\"form-group clearfix\">\n    <div class=\"col-xs-12 control-label\">\n      <label>Marker name</label>\n    </div>\n    <div class=\"col-xs-12\">\n	    <input v-bind:class=\"{'marker-error' : error}\" type=\"text\" class=\"form-control\" v-model.trim=\"name\" @keyup=\"onInputData\"/>\n      <div class=\"error-holder\" v-if=\"error\">{{error}}</div>\n    </div>\n  </div>\n\n  <div class=\"form-group clearfix\">\n    <div class=\"col-xs-12 control-label\">\n      <label>Marker icon</label>\n    </div>\n    <div class=\"col-xs-12\">\n      <div class=\"btn btn-default\" @click.prevent=\"openIconPicker\">\n        <span v-if=\"icon\">Replace icon</span>\n        <span v-else>Select an icon</span>\n      </div>\n      <div v-if=\"icon\" class=\"icon-holder\">\n        <div class=\"icon-wrapper\">Selected icon: <i :class=\"'selected-icon ' + icon\"></i></div>\n        <div v-if=\"emptyIconNotification\" class=\"text-danger icon-notification\">\n          <p>No icon was selected. The icon will be set to the one previously selected.</p>\n        </div>\n      </div>\n    </div>\n  </div>\n\n  <div class=\"form-group clearfix\">\n    <div class=\"col-xs-6\">\n      <div class=\"control-label\">\n        <label>Marker color</label>\n      </div>\n      <div class=\"input-group\" colorpicker-component>\n        <div class=\"input-group-addon\"><i :style=\"'background-color: ' + color\"></i></div>\n        <input type=\"text\" :id=\"'list-item-color-' + id\" class=\"form-control list-item-color\" v-model=\"color\" @keyup=\"onInputData\">\n      </div>\n    </div>\n    <div class=\"col-xs-6\">\n      <div class=\"control-label\">\n        <label>Marker size</label>\n      </div>\n      <input type=\"text\" class=\"form-control\" v-model.trim=\"size\" @keyup=\"onInputData\"/>\n    </div>\n  </div>\n</div>\n";
},"useData":true});