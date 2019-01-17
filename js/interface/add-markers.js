import Multiselect from 'vue-multiselect'

Fliplet.Floorplan.component('add-markers', {
  componentName: 'Add Markers',
  props: {
    id: {
      type: Number,
      default: undefined
    },
    widgetData: {
      type: Object,
      default: undefined
    },
    markersDataSourceId: {
      type: Number,
      default: undefined
    },
    markerNameColumn: {
      type: String,
      default: ''
    },
    markerFloorColumn: {
      type: String,
      default: ''
    },
    markerTypeColumn: {
      type: String,
      default: ''
    },
    markerXPositionColumn: {
      type: String,
      default: ''
    },
    markerYPositionColumn: {
      type: String,
      default: ''
    },
    dataSources: {
      type: Array,
      default: []
    },
    autoDataSource: {
      type: Boolean,
      default: false
    }
  },
  components: {
    Multiselect
  },
  data() {
    return {
      manualSelectDataSource: false,
      manualSetSettings: false,
      savedData: this.widgetData.savedData,
      markersDataSource: _.find(this.dataSources, { id: this.markersDataSourceId }),
      pinchzoomer: null,
      pzHandler: undefined,
      markerElemHandler: undefined,
      markerCtr: 0,
      markersData: [
        {
          'id': 1,
          'Name': 'Hugo Carneiro',
          'Floor name': 'Floor 1',
          'Marker style': 'Marker 1',
          'Position X': 100,
          'Position Y': 100
        },
        {
          'id': 2,
          'Name': 'Nick Valbusa',
          'Floor name': 'Floor 2',
          'Marker style': 'Marker 2',
          'Position X': 125,
          'Position Y': 125
        },
        {
          'id': 3,
          'Name': 'Ben Wynne-Simmons',
          'Floor name': 'Floor 1',
          'Marker style': 'Marker 3',
          'Position X': 150,
          'Position Y': 150
        }
      ],
      mappedMarkerData: [],
      activeMarker: 0,
      selectedFloorId: undefined,
      selectedFloorName: undefined,
      selectedMarkerName: '',
      selectedMarker: undefined
    }
  },
  computed: {
    markerFieldColumns() {
      return this.markersDataSource ? this.markersDataSource.columns : []
    },
    selectedFloor() {
      return this.widgetData.floors[this.selectedFloorIndex]
    }
  },
  watch: {
    markersDataSource(ds, oldDs) {
      if (!ds || !oldDs || ds.id !== oldDs.id) {
        // Resets select fields
        this.markerNameColumn = ''
        this.markerFloorColumn = ''
        this.markerTypeColumn = ''
        this.markerXPositionColumn = ''
        this.markerYPositionColumn = ''
      }
    }
  },
  methods: {
    mapMarkerData() {
      const newMarkerData = this.markersData.map((marker) => {
        const markerData = _.find(this.widgetData.markers, { name: marker[this.markerTypeColumn] })
        return { 
          id: marker.id,
          name: marker[this.markerNameColumn],
          floor: marker[this.markerFloorColumn],
          type: marker[this.markerTypeColumn],
          icon: markerData ? markerData.icon : '',
          color: markerData ? markerData.color : '#333333',
          positionx: marker[this.markerXPositionColumn],
          positiony: marker[this.markerYPositionColumn],
          updateName: false,
          copyOfName: ''
        }
      })

      return newMarkerData
    },
    setActiveMarker(index) {
      if (this.activeMarker !== index) {
        this.activeMarker = index
        this.setupPinchZoomer()
      }
    },
    updateFloor(floorName, index) {
      this.mappedMarkerData[index].floor = floorName
      this.setupPinchZoomer()
    },
    updateMarker(marker, index) {
      this.mappedMarkerData[index].type = marker.name
      this.mappedMarkerData[index].icon = marker.icon
      this.mappedMarkerData[index].color = marker.color
      this.setupPinchZoomer()
    },
    toggleUpdateName(index, currentName) {
      const $vm = this
      this.mappedMarkerData[index].updateName = !this.mappedMarkerData[index].updateName

      if (currentName) {
        this.mappedMarkerData[index].copyOfName = currentName
        this.$nextTick(() => $vm.$refs['changename-' + index][0].focus())
      }
    },
    cancelNameUpdate(index) {
      this.mappedMarkerData[index].name = this.mappedMarkerData[index].copyOfName
      this.mappedMarkerData[index].copyOfName = ''
      this.toggleUpdateName(index)
    },
    deleteMarker(index) {
      this.mappedMarkerData.splice(index, 1)
    },
    nameWithId({ name, id }) {
      return `${name} — [${id}]`
    },
    createNewData() {
      const $vm = this
      const name = `${this.appName} - Markers`
      Fliplet.Modal.prompt({
        title: 'Please type a name for your data source:',
        value: name
      }).then((name) => {
        if (name === null || name === '') {
          return Promise.reject()
        }

        return name
      }).then((name) => {
        return Fliplet.DataSources.create({
          name: name,
          organizationId: organizationId
        })
      }).then((ds) => {
        $vm.dataSources.push(ds)
        $vm.selectedDataSource = ds.id
      })
    },
    chooseExistingData() {
      const $vm = this
      Fliplet.Modal.confirm({
        title: 'Changing data source',
        message: '<p>If you continue the data source we created for you will be deleted.</p><p>Are you sure you want to continue?</p>'
      }).then((result) => {
        if (!result) {
          return
        }

        return $vm.deleteDataSource()
      }).then(() => {
        // Remove from dataSources
        $vm.dataSources = _.filter($vm.dataSources, (ds) => {
          return ds.id !== $vm.markersDataSourceId
        })
        $vm.markersDataSource = null

        $vm.manualSelectDataSource = true
      }) 
    },
    editDataSource() {
      Fliplet.Studio.emit('overlay', {
        name: 'widget',
        options: {
          size: 'large',
          package: 'com.fliplet.data-sources',
          title: 'Edit Data Sources',
          classes: 'data-source-overlay',
          data: {
            context: 'overlay',
            dataSourceId: this.markersDataSourceId
          }
        }
      })
    },
    deleteDataSource() {
      return Fliplet.DataSources.delete(this.markersDataSourceId)
    },
    reloadDataSources() {
      return Fliplet.DataSources.get({
        roles: 'publisher,editor',
        type: null
      }, {
        cache: false
      })
    },
    useSettings() {
      this.savedData = true
      Fliplet.Studio.emit('widget-mode', 'wide')
    },
    changeSettings() {
      this.savedData = false
      Fliplet.Studio.emit('widget-mode', 'normal')
    },
    setupPinchZoomer() {
      const $vm = this

      $vm.selectedFloorName = $vm.mappedMarkerData[$vm.activeMarker].floor
      $vm.selectedMarkerName = $vm.mappedMarkerData[$vm.activeMarker].name
      $vm.selectedMarker = $vm.mappedMarkerData[$vm.activeMarker]
      const floor = _.find($vm.widgetData.floors, { name: $vm.selectedFloorName })
      $vm.selectedFloorId = floor.id
      $vm.selectedFloorName = floor.name

      if ($vm.pinchzoomer) {
        $vm.detachEventHandlers()
        $vm.pinchzoomer = null
      }

      new PinchZoomer($('#floor-' + floor.id), {
        adjustHolderSize: false,
        maxZoom: 4,
        initZoom: 1,
        zoomStep: 0.25,
        allowMouseWheelZoom: true,
        animDuration: 0.1,
        scaleMode: 'proportionalInside',
        zoomToMarker: true,
        allowCenterDrag: true
      })

      $vm.pinchzoomer = PinchZoomer.get('floor-' + floor.id)
      $vm.pzHandler = new Hammer($vm.pinchzoomer.elem().get(0))

      $vm.loadMarkers()
      $vm.attachEventHandler()
    },
    loadMarkers() {
      const $vm = this
      this.pinchzoomer.removeMarkers(true)

      $vm.mappedMarkerData.forEach((marker, index) => {
        if (marker.floor === $vm.selectedFloorName) {
          const markerElem = $("<i class='marker " + marker.icon + "' style='left: -15px; top: -15px; position: absolute; color: " + marker.color + "' data-tooltip='" + marker.name + "'></i>")
          this.markerElemHandler = new Hammer(markerElem.get(0))
          this.pinchzoomer.addMarkers([new Marker(markerElem, { x: marker.positionx, y: marker.positiony, transformOrigin: '50% 50%', name: marker.name })])
          this.markerElemHandler.on('tap', this.onMarkerHandler)
        }
      })
    },
    attachEventHandler() {
      this.pzHandler.on('tap', this.onTapHandler)
    },
    detachEventHandlers() {
      this.pzHandler.off('tap', this.onTapHandler)

      // if (this.markerElemHandler) {
      //   this.markerElemHandler.off('tap', this.onMarkerHandler)
      // }
    },
    onTapHandler(e) {
      const markers = this.pinchzoomer.markers()

      if (!$(e.target).hasClass('marker')) {
        // Find a marker
        const markerFound = _.find(markers, (marker) => {
          return marker._vars.name === this.selectedMarker.name
        })

        const clientRect = this.pinchzoomer.elem().get(0).getBoundingClientRect()
        const elemPosX = clientRect.left
        const elemPosY = clientRect.top
        const center = e.center
        const x = (center.x - elemPosX) / (this.pinchzoomer.baseZoom() * this.pinchzoomer.zoom())
        const y = (center.y - elemPosY) / (this.pinchzoomer.baseZoom() * this.pinchzoomer.zoom())

        const markerElem = $("<i class='marker " + this.selectedMarker.icon + "' style='left: -15px; top: -15px; position: absolute; color: " + this.selectedMarker.color + "' data-tooltip='" + this.selectedMarkerName + "'></i>")
        this.markerElemHandler = new Hammer(markerElem.get(0))

        if (markerFound) {
          markerFound.vars({x: x, y, y}, true)
        } else {
          this.pinchzoomer.addMarkers([new Marker(markerElem, { x: x, y: y, transformOrigin: '50% 50%', name: this.selectedMarker.name })])
        }
        
        this.markerElemHandler.on('tap', this.onMarkerHandler)

        this.markerCtr++
      }
    },
    onMarkerHandler(e) {
      const index = this.getMarkerIndex($(e.target).attr('id'))
        
      if (index >= 0) {
        this.pinchzoomer.removeMarker(index, true)
      }
    },
    getMarkerIndex(id) {
      let markerIndex = -1
      const markers = this.pinchzoomer.markers()
      
      for (let i = 0; i < markers.length; i++) {
        const marker = markers[i]
        
        if (marker.elem().attr('id') == id) {
          markerIndex = i
          i = markers.length
        }
      }
      
      return markerIndex
    },
    saveData() {
      const markersData = _.pick(this, [
        'markersDataSourceId',
        'markerNameColumn',
        'markerFloorColumn',
        'markerTypeColumn',
        'markerXPositionColumn',
        'markerYPositionColumn'
      ])
      Fliplet.Floorplan.emit('add-markers-settings-changed', markersData)
    }
  },
  created() {
    const $vm = this
    Fliplet.Studio.onMessage((event) => {
      if (event.data && event.data.event === 'overlay-close' && event.data.data && event.data.data.dataSourceId) {
        $vm.reloadDataSources().then((dataSources) => {
          $vm.dataSources = dataSources
        })
      }
    })

    Fliplet.Floorplan.on('add-markers-save', this.saveData)
  },
  mounted() {
    const $vm = this

    // @TODO get data from data source
    // Save it to this.markersData
    // Then run this
    this.mappedMarkerData = this.mapMarkerData()

    // vm.$nextTick is not enough
    setTimeout(this.setupPinchZoomer, 1000)
  },
  destroyed() {
    Fliplet.Floorplan.off('add-markers-save', this.saveData)
  }
});