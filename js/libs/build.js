Vue.filter('auth', function (value) {
  if (!Fliplet || !Fliplet.Media || typeof Fliplet.Media.authenticate !== 'function') {
    return value
  }

  return Fliplet.Media.authenticate(value)
})

Fliplet.Widget.instance('interactive-map', function(widgetData) {
  var selector = '[data-interactive-map-id="' + widgetData.id + '"]';

  const $interactiveMap = new Vue({
    el: $(selector)[0],
    data() {
      return {
        containsData: !!(widgetData.maps && widgetData.maps.length),
        maps: widgetData.maps && widgetData.maps.length ? widgetData.maps : [],
        markerStyles: widgetData.markers && widgetData.markers.length ? widgetData.markers : [],
        markersDataSourceId: widgetData.markersDataSourceId || undefined,
        markerNameColumn: widgetData.markerNameColumn || undefined,
        markerMapColumn: widgetData.markerMapColumn || undefined,
        markerTypeColumn: widgetData.markerTypeColumn || undefined,
        markerXPositionColumn: widgetData.markerXPositionColumn || undefined,
        markerYPositionColumn: widgetData.markerYPositionColumn || undefined,
        markersData: undefined,
        mappedMarkerData: [],
        searchMarkerData: undefined,
        flPanZoomInstances: {},
        pzElement: undefined,
        markerElemHandler: undefined,
        activeMap: 0,
        activeMarker: undefined,
        imageLoaded: false,
        selectedMapData: undefined,
        selectedMarkerData: undefined,
        selectedMarkerToggle: false,
        selectedPinchMarker: undefined,
        searchTimeout: null,
        searchValue: '',
        noSearchResults: false
      }
    },
    watch: {
      searchValue() {
        this.noSearchResults = false

        if (this.searchTimeout) {
          clearTimeout(this.searchTimeout)
          this.searchTimeout = null
        }
        this.searchTimeout = setTimeout(this.filterMarkers, 500)
      }
    },
    methods: {
      filterMarkers() {
        if (!this.searchValue) {
          this.searchMarkerData = _.cloneDeep(this.mappedMarkerData)
          return
        }

        this.searchMarkerData = _.filter(this.mappedMarkerData, (marker) => {
          return _.some(['name', 'map'], (key) => {
            return marker.data[key] && marker.data[key].toString().toLowerCase().indexOf(this.searchValue.toLowerCase()) > -1
          })
        })

        if (!this.searchMarkerData.length) {
          this.noSearchResults = true
        }
      },
      clearSearch() {
        this.searchValue = ''
      },
      mapMarkerData() {
        const newMarkerData = this.markersData.map((marker) => {
          const markerData = _.find(this.markerStyles, { name: marker.data[this.markerTypeColumn] })
          return {
            id: marker.id,
            data: {
              name: marker.data[this.markerNameColumn],
              map: marker.data[this.markerMapColumn],
              type: marker.data[this.markerTypeColumn],
              icon: markerData ? markerData.icon : '',
              color: markerData ? markerData.color : '#333333',
              size: markerData ? markerData.size : '24px',
              positionX: marker.data[this.markerXPositionColumn],
              positionY: marker.data[this.markerYPositionColumn]
            }
          }
        })

        // Check if markers have all the necessary info to be shown
        if (!this.validateMarkers(newMarkerData)) {
          Fliplet.UI.Toast({
            message: 'Some markers have missing information and they may not be shown.'
          })
        }

        return newMarkerData
      },
      validateMarkers(markersData) {
        if (!markersData || !markersData.length) {
          return true
        }

        const missingInfo = markersData.some((marker) => {
          const results = []
          for (const key in marker.data) {
            if (!marker.data[key] || marker.data == '') {
              results.push(false)
              continue
            }
          }

          if (results.length) {
            return false
          }

          return true
        })

        return missingInfo
      },
      setupFlPanZoom() {
        this.selectedMapData = this.maps[this.activeMap]
        this.selectedMarkerData = this.mappedMarkerData[this.activeMarker]
          ? this.mappedMarkerData[this.activeMarker].data
          : undefined
        this.selectedMarkerToggle = !!this.selectedMarkerData

        // Check if there is a map to initialize
        if (!this.selectedMapData || !this.selectedMapData.id) {
          return Fliplet.UI.Toast({
            message: 'The map couldn\'t be found. Please make sure the maps are configured correctly.'
          })
        }

        this.pzElement = $('#map-' + this.selectedMapData.id)

        if (_.isEmpty(this.flPanZoomInstances) || !this.flPanZoomInstances[this.selectedMapData.id]) {
          this.imageLoaded = false

          this.flPanZoomInstances[this.selectedMapData.id] = Fliplet.UI.PanZoom.create(this.pzElement, {
            maxZoom: 10,
            zoomStep: 0.25,
            doubleTapZoom: 3,
            animDuration: 0.1,
            allowMouseWheelZoom: false
          })
        } else {
          this.flPanZoomInstances[this.selectedMapData.id].markers.removeAll()
          this.flPanZoomInstances[this.selectedMapData.id].zoom(0, 0)
        }

        this.flPanZoomInstances[this.selectedMapData.id].on('mapImageLoaded', () => {
          this.imageLoaded = true
        })

        if (this.mappedMarkerData.length) {
          this.addMarkers(true)
          this.selectPinchMarker()
        }
      },
      selectPinchMarker() {
        // Remove any active marker
        $('.marker').removeClass('active')
        // Get markers
        const markers = this.flPanZoomInstances[this.selectedMapData.id].markers.getAll()

        if (!markers.length || _.isUndefined(this.mappedMarkerData[this.activeMarker])) {
          return
        }

        // Store first marker
        const firstMarker = markers[0]

        // Find the new selected marker from flPanZoomInstance
        this.selectedPinchMarker = _.find(markers, (marker) => {
          return marker.vars.id === this.mappedMarkerData[this.activeMarker].id
        })

        // Apply class active
        if (this.selectedPinchMarker) {
          $(this.selectedPinchMarker.getElement().get(0)).addClass('active')
        } else {
          this.activeMarker = _.findIndex(this.mappedMarkerData, (o) => { return o.id == firstMarker.vars.id })
          this.selectedMarkerData = this.mappedMarkerData[this.activeMarker].data
          $(firstMarker.getElement().get(0)).addClass('active')
        }
      },
      addMarkers(fromLoad, options) {
        const createdMarkers = []

        this.mappedMarkerData.forEach((marker, index) => {
          if (marker.data.map === this.selectedMapData.name) {

            const markerElem = $("<div id='" + marker.id + "' class='marker' data-name='" + marker.data.name + "' style='left: -15px; top: -15px; position: absolute; font-size: " + marker.data.size + ";'><i class='" + marker.data.icon + "' style='color: " + marker.data.color + "; font-size: " + marker.data.size + ";'></i><div class='active-state'><i class='" + marker.data.icon + "' style='color: " + marker.data.color + ";'></i></div></div>")

            this.markerElemHandler = new Hammer(markerElem.get(0))
            this.markerElemHandler.on('tap', this.onMarkerHandler)

            createdMarkers.push(Fliplet.UI.PanZoom.Markers.create(markerElem, { x: marker.data.positionX, y: marker.data.positionY, name: marker.data.name, id: marker.id }))
          }
        })

        this.flPanZoomInstances[this.selectedMapData.id].markers.set(createdMarkers)
      },
      onMarkerHandler(e) {
        const markers = this.flPanZoomInstances[this.selectedMapData.id].markers.getAll()
        const id = $(e.target).attr('id')
        const marker = _.find(markers, (o) => { return o.vars.id == id })
        this.activeMarker = _.findIndex(this.mappedMarkerData, (o) => { return o.id == marker.vars.id })
        this.selectPinchMarker()
        this.selectedMarkerData = this.mappedMarkerData[this.activeMarker].data
        this.selectedMarkerToggle = true
      },
      setActiveMap(mapIndex, fromSearch) {
        if (this.activeMap !== mapIndex) {
          this.activeMap = mapIndex
        }

        if (!fromSearch) {
          this.setupFlPanZoom()
        }

        this.toggleMapOverlay(false)
      },
      setActiveMarker(markerIndex) {
        this.activeMarker = markerIndex
        this.setupFlPanZoom()
        this.toggleSearchOverlay(false)
      },
      selectedMarker(markerData) {
        const mapIndex = _.findIndex(this.maps, (o) => { return o.name == markerData.data.map })
        const markerIndex = _.findIndex(this.mappedMarkerData, (o) => { return o.id == markerData.id })

        this.setActiveMap(mapIndex, true)
        this.setActiveMarker(markerIndex)
      },
      selectMarkerOnStart(options) {
        let markerIndex = -1
        let markerSelector = ''

        if (_.get(options, 'markerId')) {
          markerIndex = _.findIndex(this.mappedMarkerData, (o) => { return o.id == options.markerId })
          markerSelector = ' ' + options.markerId
        }

        if (_.get(options, 'markerName')) {
          markerIndex = _.findIndex(this.mappedMarkerData, (o) => { return o.data.name == options.markerName })
          markerSelector = ' "' + options.markerName + '"'
        }

        if (markerIndex === -1) {
          Fliplet.UI.Toast({
            message: 'Map marker' + markerSelector + ' not found'
          })
        }

        const mapIndex = markerIndex > -1
          ? _.findIndex(this.maps, (o) => {
            return o.name == this.mappedMarkerData[markerIndex].data.map
          })
          : 0

        this.setActiveMap(mapIndex, true)
        this.setActiveMarker(markerIndex > -1 ? markerIndex : 0)
      },
      selectMapOnStart(options) {
        const mapIndex = _.findIndex(this.maps, (o) => { return o.name == options.mapName })

        if (mapIndex === -1) {
          Fliplet.UI.Toast({
            message: 'Map' + (options.mapName ? ' "' + options.mapName + '"' : '') + ' not found'
          })
        }

        this.setActiveMap(mapIndex > -1 ? mapIndex : 0)
      },
      removeSelectedMarker() {
        this.selectedMarkerToggle = false

        // Wait for animation
        setTimeout(() => {
          // Remove any active marker
          $('.marker').removeClass('active')
          this.selectedMarkerData = undefined
        }, 250)
      },
      closeMapsOverlay() {
        this.toggleMapOverlay(false)
      },
      toggleMapOverlay(forceOpen) {
        if (typeof forceOpen === 'undefined') {
          $(selector).find('.interactive-maps-overlay').toggleClass('overlay-open')
          return
        }

        $(selector).find('.interactive-maps-overlay')[forceOpen ? 'addClass' : 'removeClass']('overlay-open')
      },
      closeSearchOverlay() {
        this.toggleSearchOverlay(false)
      },
      toggleSearchOverlay(forceOpen) {
        this.searchValue = ''

        if (typeof forceOpen === 'undefined') {
          $(selector).find('.interactive-maps-search-overlay').toggleClass('overlay-open')
          return
        }

        $(selector).find('.interactive-maps-search-overlay')[forceOpen ? 'addClass' : 'removeClass']('overlay-open')
      },
      onLabelClick() {
        Fliplet.Hooks.run('flInteractiveGraphicsLabelClick', {
          selectedMarker: this.selectedMarkerData,
          config: this,
          id: widgetData.id,
          uuid: widgetData.uuid,
          container: $(selector)
        })
      },
      fetchData(options) {
        return Fliplet.DataSources.connect(this.markersDataSourceId, options)
          .then((connection) => {
            return connection.find()
          })
          .catch((error) => {
            Fliplet.UI.Toast({
              message: 'Error loading data',
              actions: [
                {
                  label: 'Details',
                  action: function () {
                    Fliplet.UI.Toast({
                      html: error.message || error
                    });
                  }
                }
              ]
            })
          })
      },
      refreshInstance() {
        // We should refresh ZoomInstance only if we have selectedMapData
        // If there is no selectedMapData it means that PanZoom doesn't inited
        if (this.selectedMapData) {
          this.flPanZoomInstances[this.selectedMapData.id].refresh()
        } else {
          this.setupFlPanZoom()
        }
      },
      init() {
        const cache = { offline: true }

        return Fliplet.Hooks.run('flInteractiveGraphicsBeforeGetData', {
          config: this,
          id: widgetData.id,
          uuid: widgetData.uuid,
          container: $(selector)
        }).then(() => {
          if (this.getData) {
            this.fetchData = this.getData

            if (this.hasOwnProperty('cache')) {
              cache.offline = this.cache
            }
          }

          return this.fetchData(cache)
        }).then((dsData) => {
          this.markersData = dsData
          // Ordering and take into account numbers on the string
          this.mappedMarkerData = this.mapMarkerData().slice().sort((a,b) => a.data.name.localeCompare(b.data.name, undefined, { numeric: true }))

          return Fliplet.Hooks.run('flInteractiveGraphicsBeforeRender', {
            config: this,
            id: widgetData.id,
            uuid: widgetData.uuid,
            container: $(selector),
            markers: this.mappedMarkerData
          })
        }).then((response) => {
          this.searchMarkerData = _.cloneDeep(this.mappedMarkerData)

          if (!response.length) {
            this.$nextTick(this.setupFlPanZoom)
            return
          }

          // Check if it should start with a specific marker selected or select a map
          if (_.get(response[0], 'markerId') || _.get(response[0], 'markerName')) {
            this.selectMarkerOnStart(response[0])
          } else if (_.get(response[0], 'mapName')) {
            this.selectMapOnStart(response[0])
          } else if (_.get(response[0], 'selectMarker') === false) {
            // Ensure no marker is selected
            this.setActiveMarker(-1)
          } else {
            this.$nextTick(this.setupFlPanZoom)
          }
        })
      }
    },
    async mounted() {
      if (this.containsData) {
        if (!this.markersDataSourceId
        || !this.markerNameColumn
        || !this.markerMapColumn
        || !this.markerTypeColumn
        || !this.markerXPositionColumn
        || !this.markerYPositionColumn) {
          return Fliplet.UI.Toast({
            message: 'The data source or data source columns are misconfigured.'
          })
        }

        await this.init()
      }

      Fliplet.Hooks.on('appearanceChanged', this.refreshInstance)
      Fliplet.Hooks.on('appearanceFileChanged', this.refreshInstance)

      $(selector).removeClass('is-loading')
    },
    beforeDestroy() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
        this.searchTimeout = null
      }
    }
  });
});
