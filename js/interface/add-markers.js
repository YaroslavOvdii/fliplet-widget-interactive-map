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
    'multi-select': Multiselect
  },
  data() {
    return {
      manualSelectDataSource: false,
      manualSetSettings: false,
      savedData: this.widgetData.savedData,
      markersDataSource: _.find(this.dataSources, { id: this.markersDataSourceId }),
      selectedFloorIndex: 0,
      pinchzoomer: null,
      pzHandler: undefined,
      markerCtr: 0,
      selectedMarkerFloor: null,
      selectedMarkerIcon: null
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
    },
    selectedMarkerFloor(floor) {
      console.log(floor)
    },
    selectedMarkerIcon(icon) {
      console.log(icon)
    }
  },
  methods: {
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
    attachEventHandler() {
      this.pzHandler.on('tap', this.onTapHandler)
    },
    onTapHandler(e) {
      if (!$(e.target).hasClass('marker')) {
        const clientRect = this.pinchzoomer.elem().get(0).getBoundingClientRect()
        const elemPosX = clientRect.left
        const elemPosY = clientRect.top
        const center = e.center
        const x = (center.x - elemPosX) / (this.pinchzoomer.baseZoom() * this.pinchzoomer.zoom())
        const y = (center.y - elemPosY) / (this.pinchzoomer.baseZoom() * this.pinchzoomer.zoom())
        const markerElem = $("<div id='marker" + this.markerCtr + "' class='marker' style='left: -15px; top: -15px; position: absolute;' data-tooltip='Marker " + (this.markerCtr + 1) + "'></div>")
        const markerElemHandler = new Hammer(markerElem.get(0))

        this.pinchzoomer.addMarkers([new Marker(markerElem, { x: x, y: y, transformOrigin: '50% 50%' })])
        markerElemHandler.on('tap', this.onMarkerHandler)

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
    // vm.$nextTick is not enough
    setTimeout(() => {
      new PinchZoomer($('#floor-0'), {
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

      $vm.pinchzoomer = PinchZoomer.get('floor-0')
      $vm.pzHandler = new Hammer($vm.pinchzoomer.elem().get(0))

      $vm.attachEventHandler()
    }, 10)
  },
  destroyed() {
    Fliplet.Floorplan.off('add-markers-save', this.saveData)
  }
});