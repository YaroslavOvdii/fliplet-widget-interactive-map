const widgetId = parseInt(Fliplet.Widget.getDefaultId(), 10)
const widgetData = Fliplet.Widget.getData(widgetId) || {}

import * as Sortable from 'sortablejs/Sortable.js'

Vue.directive('sortable', {
  inserted(el, binding) {
    if (Sortable) {
      new Sortable(el, binding.value || {})
    }
  }
});

const selector = '#flooplan-app'

const app = new Vue({
  el: selector,
  data() {
    return {
      appName: Fliplet.Env.get('appName'),
      organizationId: Fliplet.Env.get('organizationId'),
      defaultColumns: window.flFloorplanColumns,
      autoDataSource: widgetData.autoDataSource || false,
      dataSources: [],
      filePickerProvider: null,
      floorPanelsIsEmpty: true,
      settings: widgetData,
      floors: widgetData.floors || [],
      markers: widgetData.markers || [],
      hasError: false,
      showAddMarkersUI: false
    }
  },
  methods: {
    makeid(length) {
      let text = ''
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

      for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length))

      return text
    },
    loadDataSources() {
      return Fliplet.DataSources.get({
        roles: 'publisher,editor',
        type: null
      }, {
        cache: false
      })
    },
    createDataSource() {
      const name = `${this.appName} - Markers`
      return Fliplet.DataSources.create({
        name: name,
        organizationId: this.organizationId,
        columns: this.defaultColumns
      }).then((ds) => {
        this.settings.markersDataSourceId = ds.id
        this.settings.markerNameColumn = 'Name'
        this.settings.markerFloorColumn = 'Floor name'
        this.settings.markerTypeColumn = 'Marker style',
        this.settings.markerXPositionColumn = 'Position X',
        this.settings.markerYPositionColumn = 'Position Y'
        this.settings.autoDataSource = true
      })
    },
    onAddFloor() {
      const newItem = {
        id: this.makeid(8),
        isFromNew: true,
        name: `Floor ${this.floors.length + 1}`,
        type: 'floor-panel'
      }

      this.floors.push(newItem)
    },
    onSortFloors(event) {
      this.floors.splice(event.newIndex, 0, this.floors.splice(event.oldIndex, 1)[0])
    },
    deleteFloor(index) {
      Fliplet.Modal.confirm({
        title: 'Delete floorplan',
        message: '<p>Are you sure you want to delete this floor?</p>'
      }).then((result) => {
        if (!result) {
          return
        }

        this.floors.splice(index, 1)
      })
    },
    onAddMarker() {
      const newItem = {
        id: this.makeid(8),
        isFromNew: true,
        name: `Marker ${this.markers.length + 1}`,
        icon: 'fa fa-circle',
        color: '#337ab7',
        type: 'marker-panel'
      }

      this.markers.push(newItem)
    },
    deleteMarker(index) {
      Fliplet.Modal.confirm({
        title: 'Delete floorplan',
        message: '<p>Are you sure you want to delete this floor?</p>'
      }).then((result) => {
        if (!result) {
          return
        }

        this.markers.splice(index, 1)
      })
    },
    onPanelSettingChanged(panelData) {
      this.floors.forEach((panel, index) => {
        if (panelData.name == panel.name && panelData.id !== panel.id) {
          panelData.error = 'Floors must have different names'
        }

        if (panelData.id === panel.id) {
          // To overcome the array change caveat
          // https://vuejs.org/v2/guide/list.html#Caveats
          Vue.set(this.floors, index, panelData)
        }
      })
    },
    onMarkerPanelSettingChanged(panelData) {
      this.markers.forEach((panel, index) => {
        if (panelData.name == panel.name && panelData.id !== panel.id) {
          panelData.error = 'Marker styles must have different names'
        }

        if (panelData.id === panel.id) {
          // To overcome the array change caveat
          // https://vuejs.org/v2/guide/list.html#Caveats
          Vue.set(this.markers, index, panelData)
        }
      })
    },
    onAddMarkersSettingChanged(addMarkersData) {
      this.settings = _.assignIn(this.settings, addMarkersData)
    },
    openAddMarkers() {
      if (!this.floors.length || !this.markers.length) {
        this.hasError = true
        return
      }
      
      this.hasError = false
      this.showAddMarkersUI = true
      Fliplet.Studio.emit('widget-mode', this.settings.savedData ? 'wide' : 'normal')
    },
    goBackToSettings() {
      this.showAddMarkersUI = false
      Fliplet.Studio.emit('widget-mode', 'normal')
    },
    prepareToSaveData() {
      if (!this.floors.length || !this.markers.length) {
        this.hasError = true
        return
      }

      // Mark 'isFromNew' as false
      this.floors.forEach((floor) => {
        floor.isFromNew = false
      })
      this.markers.forEach((marker) => {
        marker.isFromNew = false
      })

      const newSettings = {
        floors: this.floors,
        markers: this.markers
      }

      this.settings = _.assignIn(this.settings, newSettings)
      this.settings.savedData = true

      this.saveData()
    },
    saveData() {
      Fliplet.Widget.save(this.settings)
        .then(() => {
          Fliplet.Widget.complete()
        })
    }
  },
  async created() {
    Fliplet.Floorplan.on('floor-panel-settings-changed', this.onPanelSettingChanged)
    Fliplet.Floorplan.on('marker-panel-settings-changed', this.onMarkerPanelSettingChanged)
    Fliplet.Floorplan.on('add-markers-settings-changed', this.onAddMarkersSettingChanged)

    // Create data source on first time
    if (!this.autoDataSource) {
      await this.createDataSource()
    }

    // Gets the list of data sources
    this.dataSources = await this.loadDataSources()

    // Switches UI to ready state
    $(selector).removeClass('is-loading')

    Fliplet.Studio.onMessage((event) => {
      if (event.data
        && event.data.event === 'overlay-close'
        && event.data.data
        && event.data.data.dataSourceId) {
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

      Fliplet.Floorplan.emit('floors-save')
      Fliplet.Floorplan.emit('markers-save')
      Fliplet.Floorplan.emit('add-markers-save')
      this.prepareToSaveData()
    })
  },
  destroyed() {
    Fliplet.Floorplan.off('floor-panel-settings-changed', this.onPanelSettingChanged)
    Fliplet.Floorplan.off('marker-panel-settings-changed', this.onMarkerPanelSettingChanged)
    Fliplet.Floorplan.off('add-markers-settings-changed', this.onAddMarkersSettingChanged)
  }
});