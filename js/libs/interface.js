import * as Sortable from 'sortablejs/Sortable.js'
import flInteractiveMapColumns from '../config/default-table'

const widgetId = parseInt(Fliplet.Widget.getDefaultId(), 10)
const widgetData = Fliplet.Widget.getData(widgetId) || {}

Vue.directive('sortable', {
  inserted(el, binding) {
    if (Sortable) {
      new Sortable(el, binding.value || {})
    }
  }
});

const selector = '#interactive-map-app'

const app = new Vue({
  el: selector,
  data() {
    return {
      appName: Fliplet.Env.get('appName'),
      organizationId: Fliplet.Env.get('organizationId'),
      defaultColumns: flInteractiveMapColumns,
      autoDataSource: widgetData.autoDataSource || false,
      changedDataSource: widgetData.changedDataSource || false,
      dataSources: [],
      filePickerProvider: null,
      settings: widgetData,
      maps: widgetData.maps || [],
      markers: widgetData.markers || [],
      hasError: false,
      hasErrorOnSave: false,
      showAddMarkersUI: false
    }
  },
  methods: {
    loadDataSources() {
      return Fliplet.DataSources.get({
        roles: 'publisher,editor',
        type: null
      }, {
        cache: false
      })
    },
    createDataSource() {
      const name = `${this.appName} - Map Markers`
      return Fliplet.DataSources.create({
        name: name,
        organizationId: this.organizationId,
        columns: this.defaultColumns,
        bundle: true
      }).then((ds) => {
        this.settings.markersDataSourceId = ds.id
        this.settings.markerNameColumn = 'Name'
        this.settings.markerMapColumn = 'Map name'
        this.settings.markerTypeColumn = 'Marker style',
        this.settings.markerXPositionColumn = 'Position X',
        this.settings.markerYPositionColumn = 'Position Y'
        this.settings.autoDataSource = true
        this.settings.changedDataSource = false
      })
    },
    checkMapName(name, increment) {
      if (increment) {
        name = `Map ${this.maps.length + increment}`
      }

      return !!_.find(this.maps, { name: name })
    },
    generateMapName() {
      let increment = 1
      const name = `Map ${this.maps.length + increment}`
      let sameNameFound = this.checkMapName(name)

      while (sameNameFound) {
        increment++
        sameNameFound = this.checkMapName(name, increment)
      }

      const finalName = `Map ${this.maps.length + increment}`

      return finalName
    },
    onAddMap() {
      const newItem = {
        id: Fliplet.guid(),
        isFromNew: true,
        name: this.generateMapName(),
        type: 'map-panel'
      }

      this.maps.push(newItem)
      this.checkErrorStates()
    },
    onSortMaps(event) {
      this.maps.splice(event.newIndex, 0, this.maps.splice(event.oldIndex, 1)[0])
    },
    deleteMap(index) {
      Fliplet.Modal.confirm({
        title: 'Delete map',
        message: '<p>Any marker assigned to this map won\'t be visible until you assign it to a different map.</p><p>Are you sure you want to delete this map?</p>'
      }).then((result) => {
        if (!result) {
          return
        }

        this.maps.splice(index, 1)
      })
    },
    checkErrorStates() {
      if (this.maps.length) {
        this.hasErrorOnSave = false

        if (this.markers.length) {
          this.hasError = false
        }
      }
    },
    onPanelSettingChanged(panelData) {
      this.maps.forEach((panel, index) => {
        // Reset error messages
        panel.error = ''
        panelData.error = ''
        Vue.set(this.maps, index, panel)

        // If exists update panel with new data
        if (panelData.id === panel.id) {
          // To overcome the array change caveat
          // https://vuejs.org/v2/guide/list.html#Caveats
          Vue.set(this.maps, index, panelData)
        }
      })

      // Find panels with same names
      var result = _.difference(this.maps, _.uniqBy(this.maps, 'name'))
      if (result.length) {
        result.forEach((panel) => {
          panel.error = 'Maps must have different names'
        })
      }
    },
    onAddMarkersSettingChanged(addMarkersData) {
      this.settings = _.assignIn(this.settings, addMarkersData)
      this.prepareToSaveData(true)
    },
    addMarker() {
      const newItem = {
        id: Fliplet.guid(),
        isFromNew: true,
        name: `Marker ${this.markers.length + 1}`,
        icon: 'fa fa-circle',
        color: '#337ab7',
        type: 'marker-panel',
        size: '24px'
      }

      this.markers.push(newItem)
      this.checkErrorStates()
    },
    openAddMarkers() {
      this.hasError = false
      this.hasErrorOnSave = false

      // Error checking
      if (!this.maps.length) {
        this.hasError = {
          message: 'You need to add at least one map before continuing.'
        }
        return
      }
      // Check if maps have images
      const mapsWithoutImages = _.filter(this.maps, (map) => {
        return typeof map.image === 'undefined'
      })
      if (mapsWithoutImages.length) {
        this.hasError = {
          message: 'You need to select an image for each map you have created before continuing.'
        }
        return
      }

      // Check if maps have same name
      const mapsWithSameName = _.filter(this.maps, (map) => {
        return typeof map.error !== 'undefined' && map.error !== ''
      })
      if (mapsWithSameName.length) {
        this.hasError = {
          message: 'Maps must have different names.'
        }
        return
      }

      if (!this.markers.length) {
        this.addMarker()
      }

      this.prepareToSaveData(true)
      this.showAddMarkersUI = true
      Fliplet.Studio.emit('widget-mode', this.settings.savedData ? 'full-screen' : 'normal')
    },
    goBackToSettings() {
      this.showAddMarkersUI = false
      Fliplet.Studio.emit('widget-mode', 'normal')
      this.prepareToSaveData(true, true)
    },
    saveMapSettings() {
      this.prepareToSaveData(true, true)
    },
    prepareToSaveData(stopComplete, imageSaved) {
      this.hasError = false
      this.hasErrorOnSave = false

      if (!stopComplete && !this.maps.length) {
        this.hasErrorOnSave = {
          message: 'You need to add at least one map to save and close.'
        }
        return
      }

      if (stopComplete && !imageSaved && (!this.maps.length || !this.markers.length)) {
        this.hasError = {
          message: 'You need to add at least one map before continuing.'
        }
        return
      }

      // Check if maps have images
      const mapsWithoutImages = _.filter(this.maps, (map) => {
        return typeof map.image === 'undefined'
      })
      if (!stopComplete && mapsWithoutImages.length) {
        this.hasErrorOnSave = {
          message: 'You need to select an image for each map you have created to save and close.'
        }
        return
      } else if (stopComplete && mapsWithoutImages.length) {
        this.hasError = {
          message: 'You need to select an image for each map you have created before continuing.'
        }
        return
      }

      // Check if DS info missing
      if (!this.settings.markerMapColumn
        || !this.settings.markerNameColumn
        || !this.settings.markerTypeColumn
        || !this.settings.markerXPositionColumn
        || !this.settings.markerYPositionColumn) {
        this.hasErrorOnSave = {
          message: 'Your data source columns are misconfigured. Please make sure you selected a column for each field.'
        }
        return
      }

      // Check if DS info missing
      if (!this.settings.markersDataSourceId) {
        this.hasErrorOnSave = {
          message: 'Your data source is misconfigured. Please make sure you selected and configured one.'
        }
        return
      }

      // Mark 'isFromNew' as false
      this.maps.forEach((map) => {
        map.isFromNew = false
      })
      this.markers.forEach((marker) => {
        marker.isFromNew = false
      })

      const newSettings = {
        maps: this.maps,
        markers: this.markers
      }

      this.settings = _.assignIn(this.settings, newSettings)
      this.settings.savedData = true

      let promise = Promise.resolve()
      if (this.settings.dataSourceToDelete && !stopComplete) {
        promise = Fliplet.DataSources.delete(this.settings.dataSourceToDelete)
      }

      promise
        .then(() => {
          this.saveData(stopComplete, imageSaved)
        })
    },
    saveData(stopComplete, imageSaved) {
      Fliplet.Widget.save(this.settings)
        .then(() => {
          if (!stopComplete) {
            Fliplet.Widget.complete()
            Fliplet.Studio.emit('reload-widget-instance', widgetId)
            return
          }
          if (imageSaved) {
            Fliplet.Studio.emit('reload-widget-instance', widgetId)
          }
        })
    }
  },
  async created() {
    Fliplet.InteractiveMap.on('map-panel-settings-changed', this.onPanelSettingChanged)
    Fliplet.InteractiveMap.on('new-map-added', this.saveMapSettings)
    Fliplet.InteractiveMap.on('add-markers-settings-changed', this.onAddMarkersSettingChanged)

    // Create data source on first time
    if (!this.autoDataSource) {
      await this.createDataSource()
    }

    // Gets the list of data sources
    this.dataSources = await this.loadDataSources()

    // Switches UI to ready state
    $(selector).removeClass('is-loading')

    Fliplet.Studio.onMessage((event) => {
      if (_.get(event, 'data.event') === 'overlay-close' && _.get(event.data, 'data.dataSourceId')) {
        this.loadDataSources()
      }
    })

    Fliplet.Widget.onSaveRequest(() => {
      if (window.filePickerProvider) {
        window.filePickerProvider.forwardSaveRequest()
        return
      }

      if (window.iconPickerProvider) {
        window.iconPickerProvider.forwardSaveRequest()
        return
      }

      Fliplet.InteractiveMap.emit('maps-save')
      Fliplet.InteractiveMap.emit('markers-save')
      Fliplet.InteractiveMap.emit('add-markers-save')
      this.prepareToSaveData()
    })
  },
  destroyed() {
    Fliplet.InteractiveMap.off('map-panel-settings-changed', this.onPanelSettingChanged)
    Fliplet.InteractiveMap.off('new-map-added', this.saveMapSettings)
    Fliplet.InteractiveMap.off('add-markers-settings-changed', this.onAddMarkersSettingChanged)
  }
});