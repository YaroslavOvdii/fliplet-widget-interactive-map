Fliplet.Widget.instance('interactive-map', function(widgetData) {
  var selector = '[data-interactive-map-id="' + widgetData.id + '"]';

  const $interactiveMap = new Vue({
    el: $(selector)[0],
    data() {
      return {
        containsData: widgetData.maps && widgetData.maps.length,
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
        activeMarker: 0,
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

        return newMarkerData
      },
      setupFlPanZoom() {
        this.selectedMapData = this.maps[this.activeMap]
        this.selectedMarkerData = this.mappedMarkerData[this.activeMarker]
          ? this.mappedMarkerData[this.activeMarker].data
          : undefined
        this.selectedMarkerToggle = !!this.selectedMarkerData

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

        if (!markers.length) {
          return
        }

        // Store first marker
        const marker = markers[0]

        // Find the new selected marker from flPanZoomInstance
        this.selectedPinchMarker = _.find(markers, (marker) => {
          return marker.vars.id === this.mappedMarkerData[this.activeMarker].id
        })
        // Apply class active
        if (this.selectedPinchMarker) {
          $(this.selectedPinchMarker.getElement().get(0)).addClass('active')
        } else {
          this.activeMarker = _.findIndex(this.mappedMarkerData, (o) => { return o.id == marker.vars.id })
          this.selectedMarkerData = this.mappedMarkerData[this.activeMarker].data
          $(markers[0].getElement().get(0)).addClass('active')
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
      selectMarkerOnStart() {
        let markerIndex = undefined

        if (!_.hasIn(this.startOnMarker, 'id') && !_.hasIn(this.startOnMarker, 'name')) {
          this.$nextTick(this.setupFlPanZoom)
          return
        }

        if (_.hasIn(this.startOnMarker, 'id')) {
          markerIndex = _.findIndex(this.mappedMarkerData, (o) => { return o.id == this.startOnMarker.id })
        }

        if (_.hasIn(this.startOnMarker, 'name')) {
          markerIndex = _.findIndex(this.mappedMarkerData, (o) => { return o.data.name == this.startOnMarker.name })
        }

        const mapName = this.mappedMarkerData[markerIndex].data.map
        const mapIndex = _.findIndex(this.maps, (o) => { return o.name == mapName })

        this.setActiveMap(mapIndex, true)
        this.setActiveMarker(markerIndex)
      },
      selectMapOnStart() {
        if (!_.hasIn(this.startOnMap, 'name')) {
          this.$nextTick(this.setupFlPanZoom)
          return
        }

        const mapIndex = _.findIndex(this.maps, (o) => { return o.name == this.startOnMap.name })
        this.setActiveMap(mapIndex)
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
        Fliplet.Hooks.run('flInteractiveMapOnLabelClick', {
          selectedMarker: this.selectedMarkerData,
          config: this,
          id: widgetData.id,
          uuid: widgetData.uuid,
          container: $(selector)
        }).then(() => {
          if (this.labelAction) {
            this.labelAction()
          }
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
      init() {
        const cache = { offline: true }

        return Fliplet.Hooks.run('flInteractiveMapBeforeGetData', {
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

          return Fliplet.Hooks.run('flInteractiveMapBeforeRenderMap', {
            config: this,
            id: widgetData.id,
            uuid: widgetData.uuid,
            container: $(selector),
            markers: this.mappedMarkerData
          })
        }).then(() => {
          this.searchMarkerData = _.cloneDeep(this.mappedMarkerData)

          // Check if startOnMarker is set
          if (this.startOnMarker) {
            this.selectMarkerOnStart()
          } else if (this.startOnMap) {
            this.selectMapOnStart()
          } else {
            this.$nextTick(this.setupFlPanZoom)
          }
        })
      }
    },
    async mounted() {
      if (this.containsData) {
        await this.init()
      }

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